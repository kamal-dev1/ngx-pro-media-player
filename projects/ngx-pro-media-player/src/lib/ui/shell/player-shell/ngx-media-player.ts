import {
  Component,
  ElementRef,
  ViewChild,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioEngine } from '../../../core/engine/player.engine';
import { QueueEngine } from '../../../core/engine/queue.engine';
import { MediaItem } from '../../../core/models/media-item.model';
import { PlayerStore } from '../../../core/store';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { I18nService } from '../../../i18n/i18n.service';


@Component({
  selector: 'ngx-media-player',
  imports: [CommonModule, FormsModule,DragDropModule],
  templateUrl: './ngx-media-player.html',
  styleUrl: './ngx-media-player.css',
})
export class NgxMediaPlayer {
  readonly i18n = inject(I18nService);
  /** کراس‌فید ثابت (ثانیه) — فقط در کد؛ در UI تنظیم نمی‌شود */
  private static readonly CROSSFADE_SECONDS = 2.5;

  @ViewChild('videoPlayer')
  set videoPlayerRef(ref: ElementRef<HTMLVideoElement> | undefined) {
    this.audio.attachVideoElement(ref?.nativeElement ?? null);
  }

  readonly mediaList = input<MediaItem[]>([]);
  readonly language = input<'fa' | 'en'>('fa');
  readonly direction = input<'rtl' | 'ltr'>('rtl');

  readonly store = inject(PlayerStore);
  private readonly audio = inject(AudioEngine);
  private readonly queue = inject(QueueEngine);
  private lastEndedTick = 0;

  readonly defaultCover =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="100%" height="100%" fill="%23171717"/><text x="50%" y="50%" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle" font-size="28">No Cover</text></svg>';
    private lastMediaList: MediaItem[] | null = null;
    buffered = signal(0);
  constructor() {


    this.store.crossfadeSeconds.set(NgxMediaPlayer.CROSSFADE_SECONDS);

    effect(() => {
      this.store.language.set(this.language());
      this.store.direction.set(this.direction());
      this.i18n.setLanguage(this.language());
    });
    effect(() => {
      const list = this.mediaList();
      if (list !== this.lastMediaList) {
        this.lastMediaList = list;
        this.queue.setQueue(list);
      }
    });

    effect(() => {
      const endedTick = this.store.endedTick();
      if (endedTick <= 0 || endedTick === this.lastEndedTick) {
        return;
      }

      this.lastEndedTick = endedTick;
      void this.queue.next();
    });

    // در constructor بعد از effect های دیگه:
    effect(() => {
      const media = this.store.currentMedia();
      if (!media) return;
      
      const el = document.querySelector('audio') as HTMLAudioElement;
      if (!el) return;
      
      el.ontimeupdate = () => {
        if (el.buffered.length > 0) {
          this.buffered.set(el.buffered.end(el.buffered.length - 1));
        }
      };
    })
    this.audio.setMediaSessionHandlers({
      onPlay: () => this.audio.resume(),
      onPause: () => this.audio.pause(),
      onNext: () => this.queue.next(),
      onPrevious: () => this.queue.previous(),
      onSeekTo: (time) => this.audio.seek(time),
    });
  }

  trackById(_: number, item: MediaItem): string {
    return item.id;
  }
  private wasDragging = false;

  onDragStarted(): void {
    this.wasDragging = false;
  }
  
  onDragMoved(): void {
    this.wasDragging = true;
  }
  
  onDrop(event: CdkDragDrop<MediaItem[]>): void {
    this.queue.reorder(event.previousIndex, event.currentIndex);
  }
  async playByIndex(index: number): Promise<void> {
    if (this.wasDragging) {
      this.wasDragging = false;
      return;
    }
    await this.queue.playIndex(index);
  }

  async togglePlayPause(): Promise<void> {
    await this.audio.togglePlayPause();
  }

  async next(): Promise<void> {
    await this.queue.next();
  }

  async previous(): Promise<void> {
    await this.queue.previous();
  }

  seek(value: string): void {
    this.audio.seek(Number(value));
  }

  getEventValue(event: Event): string {
    const target = event.target as HTMLInputElement | HTMLSelectElement | null;
    return target?.value ?? '0';
  }

  setVolume(value: string): void {
    this.audio.setVolume(Number(value));
  }

  setRate(value: string | number): void {
    this.audio.setPlaybackRate(Number(value));
  }

  toggleShuffle(): void {
    this.store.shuffle.update((v) => !v);
  }

  cycleRepeat(): void {
    const current = this.store.repeatMode();
    const next = current === 'off' ? 'all' : current === 'all' ? 'one' : 'off';
    this.store.repeatMode.set(next);
  }

  toggleMute(): void {
    this.audio.toggleMute();
  }

  toggleQueue(): void {
    this.store.queueOpen.update((v) => !v);
  }

  toggleLyrics(): void {
    this.store.lyricsOpen.update((v) => !v);
  }

  toggleMini(): void {
    this.store.isMinimized.update((v) => !v);
  }

  onDragStart(index: number): void {
    this.store.dragIndex.set(index);
  }



  coverOf(item: MediaItem | null): string {
    return item?.cover || item?.poster || this.defaultCover;
  }

  async toggleFullscreen(video: HTMLVideoElement): Promise<void> {
    if (!document.fullscreenElement) {
      await video.requestFullscreen();
      return;
    }
    await document.exitFullscreen();
  }

  formattedTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return '00:00';
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  seekTrackStyle(): string {
    const current = this.store.duration() ? (this.store.currentTime() / this.store.duration()) * 100 : 0;
    const buffered = this.store.duration() ? (this.store.buffered() / this.store.duration()) * 100 : 0;
    const isRtl = this.store.direction() === 'rtl';
  
    const played = `${current}%`;
    const buf = `${Math.max(current, buffered)}%`;
  
    if (isRtl) {
      return `--seek-played: ${played}; --seek-buffered: ${buf}; --seek-direction: to left`;
    }
    return `--seek-played: ${played}; --seek-buffered: ${buf}; --seek-direction: to right`;
  }
}
