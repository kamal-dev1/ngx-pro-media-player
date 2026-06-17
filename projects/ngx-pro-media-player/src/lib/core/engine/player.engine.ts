import { Injectable, NgZone, inject } from '@angular/core';
import { MediaItem } from '../models/media-item.model';
import { PlayerStore } from '../store';

@Injectable({
  providedIn: 'root',
})
export class AudioEngine {
  private readonly store = inject(PlayerStore);
  private readonly zone = inject(NgZone);

  private readonly audioA = new Audio();
  private readonly audioB = new Audio();
  private activeAudio = this.audioA;
  private standbyAudio = this.audioB;

  private video: HTMLVideoElement | null = null;
  private fadeIntervalId: ReturnType<typeof setInterval> | null = null;
  private playSessionId = 0;
  /** المانی که UI (پروگرس/پلی) باید از آن پیروی کند؛ جدا از activeAudio برای جلوگیری از race */
  private progressSource: HTMLMediaElement | null = null;

  constructor() {
    this.audioA.preload = 'metadata';
    this.audioB.preload = 'metadata';
    this.bindEvents(this.audioA);
    this.bindEvents(this.audioB);
  }

  attachVideoElement(video: HTMLVideoElement | null): void {
    this.video = video;
    if (!video) {
      return;
    }

    video.preload = 'auto';
    video.volume = this.store.volume();
    video.muted = this.store.muted();
    video.playbackRate = this.store.playbackRate();
    this.bindEvents(video);
  }

  private bindEvents(element: HTMLMediaElement): void {
    element.ontimeupdate = () => {
      if (this.progressSource !== element) return;
      if (!this.elementMatchesCurrentMedia(element)) return;
      this.patchStore(() => this.store.currentTime.set(element.currentTime || 0));
    };

    element.onloadedmetadata = () => {
      if (this.progressSource !== element) return;
      if (!this.elementMatchesCurrentMedia(element)) return;
      this.patchStore(() =>
        this.store.duration.set(Number.isFinite(element.duration) ? element.duration : 0),
      );
    };

    element.ondurationchange = () => {
      if (this.progressSource !== element) return;
      if (!this.elementMatchesCurrentMedia(element)) return;
      this.patchStore(() =>
        this.store.duration.set(Number.isFinite(element.duration) ? element.duration : 0),
      );
    };

    element.onplay = () => {
      if (this.progressSource !== element) return;
      if (!this.elementMatchesCurrentMedia(element)) return;
      this.patchStore(() => this.store.isPlaying.set(true));
    };

    element.onpause = () => {
      if (this.progressSource !== element) return;
      this.patchStore(() => this.store.isPlaying.set(false));
    };

    element.onended = () => {
      if (this.progressSource !== element) return;
      if (!this.elementMatchesCurrentMedia(element)) return;
      this.patchStore(() => this.store.endedTick.update((v) => v + 1));
    };
    element.onprogress = () => {
      if (this.progressSource !== element) return;
      if (element.buffered.length > 0) {
        this.patchStore(() =>
          this.store.buffered.set(element.buffered.end(element.buffered.length - 1))
        );
      }
    };
    
    element.ontimeupdate = () => {
      if (this.progressSource !== element) return;
      if (!this.elementMatchesCurrentMedia(element)) return;
      
      // ✅ buffer
      if (element.buffered.length > 0) {
        this.patchStore(() =>
          this.store.buffered.set(element.buffered.end(element.buffered.length - 1))
        );
      }
      
      this.patchStore(() => this.store.currentTime.set(element.currentTime || 0));
    };
  }

  /** جلوگیری از اعمال رویدادهای بارِ قبلی روی همان المان بعد از سوئیچ سریع */
  private elementMatchesCurrentMedia(element: HTMLMediaElement): boolean {
    const media = this.store.currentMedia();
    if (!media?.url) return true;
    const want = media.url.trim();
    const cur = (element.currentSrc || element.src || '').trim();
    if (!cur) return true;
    if (cur === want) return true;
    try {
      const abs = new URL(want, typeof document !== 'undefined' ? document.baseURI : undefined).href;
      if (cur === abs) return true;
    } catch {
      /* noop */
    }
    return cur.endsWith(want) || want.endsWith(cur);
  }

  private patchStore(fn: () => void): void {
    this.zone.run(fn);
  }

  /** همگام با DOM؛ چون گاهی onplay دیر می‌رسد یا با progressSource از قلم می‌افتد */
  private markPlaying(playing: boolean): void {
    this.patchStore(() => this.store.isPlaying.set(playing));
  }

  private getActiveElement(mediaType?: MediaItem['type']): HTMLMediaElement {
    const type = mediaType ?? this.store.currentMedia()?.type ?? 'audio';
    return type === 'video' && this.video ? this.video : this.activeAudio;
  }

  /** همیشه src+load؛ اگر فقط play() بزنیم و URL همان قبلی باشد، مرورگر اغلب رویدادها را دوباره نمی‌فرستد و پروگرس گیر می‌کند. */
  private assignSourceAndLoad(element: HTMLMediaElement, url: string): void {
    element.pause();
    element.src = url;
    element.load();
  }
  private bufferIntervalId: ReturnType<typeof setInterval> | null = null;

  private startBufferTracking(element: HTMLMediaElement): void {
    this.stopBufferTracking();
    this.bufferIntervalId = setInterval(() => {
      if (element.buffered.length > 0) {
        this.patchStore(() =>
          this.store.buffered.set(element.buffered.end(element.buffered.length - 1))
        );
      }
    }, 500);
  }
  
  private stopBufferTracking(): void {
    if (!this.bufferIntervalId) return;
    clearInterval(this.bufferIntervalId);
    this.bufferIntervalId = null;
  }
  /** تا `<video>` از سمت تمپلیت وصل شود؛ وگرنه play روی Audio می‌رود و صفحه سیاه می‌ماند. */
  private async ensureVideoElementReady(sessionId: number, timeoutMs = 4000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (sessionId !== this.playSessionId) return false;
      if (this.video) return true;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    return false;
  }

  async play(media: MediaItem): Promise<void> {
    this.playSessionId += 1;
    const sessionId = this.playSessionId;
    this.stopFadeTimer();
    this.stopBufferTracking();
    this.progressSource = null;
    this.patchStore(() => this.store.buffered.set(0)); // ✅ ریست buffer
    if (media.type === 'video') {
      this.stopAllAudios();
      const ready = await this.ensureVideoElementReady(sessionId);
      if (!ready || sessionId !== this.playSessionId) return;
      const player = this.video!;
      this.progressSource = player;
      this.assignSourceAndLoad(player, media.url);
      this.startBufferTracking(player);

      player.volume = this.store.volume();
      player.muted = this.store.muted();
      player.playbackRate = this.store.playbackRate();
      try {
        await player.play();
      } catch {
        if (sessionId !== this.playSessionId) return;
        this.markPlaying(false);
        return;
      }
      if (sessionId !== this.playSessionId) return;
      this.markPlaying(!player.paused);
      this.updateMediaSession(media);
      return;
    }

    if (this.video) {
      this.video.pause();
      this.video.removeAttribute('src');
      this.video.load();
    }

    if (this.shouldCrossfade(media.url)) {
      await this.crossfadeTo(media.url, sessionId);
    } else {
      this.resetAudioPair();
      await this.playOn(this.activeAudio, media.url, sessionId);
    }
    if (sessionId !== this.playSessionId) return;

    // بعد از await، CFA مقدار فیلد را فقط `null` می‌داند؛ مقدار واقعی را صریح می‌خوانیم.
    const ps: HTMLMediaElement | null = this.progressSource as HTMLMediaElement | null;
    this.markPlaying(ps != null ? !ps.paused : false);
    this.updateMediaSession(media);
  }

  pause(): void {
    this.getActiveElement().pause();
    this.markPlaying(false);
  }

  resume(): void {
    const el = this.getActiveElement();
    if (el.readyState === 0 && el.src) {
      el.load();
    }
    void el
      .play()
      .then(() => {
        if (this.progressSource && el !== this.progressSource) return;
        this.markPlaying(!el.paused);
      })
      .catch(() => this.markPlaying(false));
  }

  seek(seconds: number): void {
    this.getActiveElement().currentTime = seconds;
  }

  setVolume(volume: number): void {
    const safeVolume = Math.min(1, Math.max(0, volume));
    this.activeAudio.volume = safeVolume;
    this.standbyAudio.volume = safeVolume;
    if (this.video) this.video.volume = safeVolume;
    this.store.volume.set(safeVolume);
  }

  toggleMute(): void {
    const nextMuted = !this.store.muted();
    this.activeAudio.muted = nextMuted;
    this.standbyAudio.muted = nextMuted;
    if (this.video) this.video.muted = nextMuted;
    this.store.muted.set(nextMuted);
  }

  setPlaybackRate(rate: number): void {
    this.activeAudio.playbackRate = rate;
    this.standbyAudio.playbackRate = rate;
    if (this.video) this.video.playbackRate = rate;
    this.store.playbackRate.set(rate);
  }

  async togglePlayPause(): Promise<void> {
    if (this.store.isPlaying()) {
      this.pause();
      return;
    }
    this.resume();
  }

  setMediaSessionHandlers(handlers: {
    onPlay: () => void | Promise<void>;
    onPause: () => void | Promise<void>;
    onNext: () => void | Promise<void>;
    onPrevious: () => void | Promise<void>;
    onSeekTo: (time: number) => void | Promise<void>;
  }): void {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', () => void handlers.onPlay());
    navigator.mediaSession.setActionHandler('pause', () => void handlers.onPause());
    navigator.mediaSession.setActionHandler('nexttrack', () => void handlers.onNext());
    navigator.mediaSession.setActionHandler('previoustrack', () => void handlers.onPrevious());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number') {
        void handlers.onSeekTo(details.seekTime);
      }
    });
  }

  private shouldCrossfade(nextUrl: string): boolean {
    const seconds = this.store.crossfadeSeconds();
    return (
      seconds > 0 &&
      !this.activeAudio.paused &&
      !!this.activeAudio.currentSrc &&
      this.activeAudio.currentSrc !== nextUrl
    );
  }

  private async playOn(player: HTMLAudioElement, url: string, sessionId: number): Promise<void> {
    // باید قبل از load باشد؛ وگرنه loadedmetadata زودتر از فیلتر رد می‌شود و duration روی 0 می‌ماند.
    this.progressSource = player;
    this.assignSourceAndLoad(player, url);
    this.startBufferTracking(player);
    player.volume = this.store.volume();
    player.muted = this.store.muted();
    player.playbackRate = this.store.playbackRate();
    try {
      await player.play();
    } catch {
      if (sessionId !== this.playSessionId) return;
      this.markPlaying(false);
      return;
    }
    if (sessionId !== this.playSessionId) return;
    if (Number.isFinite(player.duration) && player.duration > 0) {
      this.patchStore(() => this.store.duration.set(player.duration));
    }
    this.markPlaying(!player.paused);
  }

  private async crossfadeTo(url: string, sessionId: number): Promise<void> {
    const from = this.activeAudio;
    const to = this.standbyAudio;
    const baseVolume = this.store.volume();
    const fadeMs = Math.max(0.1, this.store.crossfadeSeconds()) * 1000;
    const stepMs = 50;
    const steps = Math.max(1, Math.floor(fadeMs / stepMs));
    let step = 0;

    this.progressSource = to;
    this.assignSourceAndLoad(to, url);
    this.startBufferTracking(to)

    to.volume = 0;
    to.muted = this.store.muted();
    to.playbackRate = this.store.playbackRate();
    try {
      await to.play();
    } catch {
      if (sessionId !== this.playSessionId) return;
      to.pause();
      this.markPlaying(false);
      return;
    }
    if (sessionId !== this.playSessionId) {
      to.pause();
      return;
    }

    // Make the new track the active one immediately so progress/controls sync correctly.
    this.activeAudio = to;
    this.standbyAudio = from;
    this.progressSource = to;
    this.markPlaying(!to.paused);

    this.fadeIntervalId = setInterval(() => {
      if (sessionId !== this.playSessionId) {
        this.stopFadeTimer();
        return;
      }
      step += 1;
      const progress = Math.min(1, step / steps);
      to.volume = baseVolume * progress;
      from.volume = baseVolume * (1 - progress);

      if (progress >= 1) {
        this.stopFadeTimer();
        from.pause();
        from.currentTime = 0;
        from.volume = baseVolume;
      }
    }, stepMs);
  }

  private stopFadeTimer(): void {
    if (!this.fadeIntervalId) return;
    clearInterval(this.fadeIntervalId);
    this.fadeIntervalId = null;
  }

  private stopStandbyAudio(): void {
    this.standbyAudio.pause();
    this.standbyAudio.currentTime = 0;
    this.standbyAudio.volume = this.store.volume();
  }

  private stopAllAudios(): void {
    this.audioA.pause();
    this.audioB.pause();
    this.audioA.currentTime = 0;
    this.audioB.currentTime = 0;
    const baseVolume = this.store.volume();
    this.audioA.volume = baseVolume;
    this.audioB.volume = baseVolume;
    this.progressSource = null;
  }

  private resetAudioPair(): void {
    this.stopAllAudios();
    this.activeAudio = this.audioA;
    this.standbyAudio = this.audioB;
  }

  private updateMediaSession(media: MediaItem): void {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: media.title,
      artist: media.artist ?? '',
      album: media.album ?? '',
      artwork: media.cover ? [{ src: media.cover, sizes: '512x512', type: 'image/png' }] : [],
    });
    navigator.mediaSession.playbackState = this.store.isPlaying() ? 'playing' : 'paused';
    if ('setPositionState' in navigator.mediaSession) {
      navigator.mediaSession.setPositionState({
        duration: this.store.duration() || 0,
        playbackRate: this.store.playbackRate(),
        position: this.store.currentTime() || 0,
      });
    }
  }

}