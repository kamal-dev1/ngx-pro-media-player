import { Injectable, computed, signal } from '@angular/core';
import { MediaItem } from './models/media-item.model';

export type PlayerRepeatMode = 'off' | 'one' | 'all';
export type PlayerLanguage = 'fa' | 'en';
export type PlayerDirection = 'rtl' | 'ltr';

@Injectable({
  providedIn: 'root',
})
export class PlayerStore {
  readonly queue = signal<MediaItem[]>([]);
  readonly currentIndex = signal<number>(-1);

  readonly isPlaying = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);

  readonly volume = signal(0.85);
  readonly muted = signal(false);
  readonly playbackRate = signal(1);
  readonly crossfadeSeconds = signal(0);

  readonly repeatMode = signal<PlayerRepeatMode>('off');
  readonly shuffle = signal(false);

  readonly isMinimized = signal(false);
  readonly language = signal<PlayerLanguage>('fa');
  readonly direction = signal<PlayerDirection>('rtl');

  readonly queueOpen = signal(false);
  readonly lyricsOpen = signal(false);

  readonly endedTick = signal(0);
  readonly dragIndex = signal<number | null>(null);

  readonly currentMedia = computed<MediaItem | null>(() => {
    const list = this.queue();
    const index = this.currentIndex();
    if (!list.length || index < 0 || index >= list.length) {
      return null;
    }
    return list[index];
  });

  readonly hasQueue = computed(() => this.queue().length > 1);
  readonly buffered = signal(0);
}
