import { Injectable, inject } from '@angular/core';
import { MediaItem } from '../models/media-item.model';
import { PlayerStore } from '../store';
import { AudioEngine } from './player.engine';

@Injectable({
  providedIn: 'root',
})
export class QueueEngine {
  private readonly store = inject(PlayerStore);
  private readonly audio = inject(AudioEngine);

  setQueue(list: MediaItem[]): void {
    this.store.queue.set(list);
    if (!list.length) {
      this.store.currentIndex.set(-1);
      return;
    }
    if (this.store.currentIndex() < 0 || this.store.currentIndex() >= list.length) {
      this.store.currentIndex.set(0);
    }
  }


  async playIndex(index: number): Promise<void> {
    const queue = this.store.queue();
    if (!queue.length || index < 0 || index >= queue.length) {
      return;
    }

    this.store.currentIndex.set(index);
    this.store.currentTime.set(0);
    this.store.duration.set(0);
    this.store.isPlaying.set(false);
    const media = queue[index];
    await this.audio.play(media);
  }

  async playCurrent(): Promise<void> {
    const media = this.store.currentMedia();
    if (!media) return;
    await this.audio.play(media);
  }

  async next(): Promise<void> {
    const queue = this.store.queue();
    if (!queue.length) return;

    const repeatMode = this.store.repeatMode();
    if (repeatMode === 'one') {
      await this.playCurrent();
      return;
    }

    let nextIndex: number;
    if (this.store.shuffle() && queue.length > 1) {
      nextIndex = Math.floor(Math.random() * queue.length);
      while (nextIndex === this.store.currentIndex()) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }
    } else {
      nextIndex = this.store.currentIndex() + 1;
    }

    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        this.audio.pause();
        return;
      }
    }

    await this.playIndex(nextIndex);
  }

  async previous(): Promise<void> {
    const queue = this.store.queue();
    if (!queue.length) return;

    if (this.store.currentTime() > 5) {
      this.audio.seek(0);
      return;
    }

    let index = this.store.currentIndex() - 1;
    if (index < 0) {
      index = this.store.repeatMode() === 'all' ? queue.length - 1 : 0;
    }
    await this.playIndex(index);
  }

  reorder(fromIndex: number, toIndex: number): void {
    const list = [...this.store.queue()];
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= list.length ||
      toIndex >= list.length ||
      fromIndex === toIndex
    ) {
      return;
    }
  
    const currentIndex = this.store.currentIndex();
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
  
    // ✅ محاسبه index جدید آیتم در حال پخش بعد از جابجایی
    let newCurrentIndex = currentIndex;
    if (currentIndex === fromIndex) {
      newCurrentIndex = toIndex;
    } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
      newCurrentIndex = currentIndex - 1;
    } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
      newCurrentIndex = currentIndex + 1;
    }
  
    this.store.queue.set(list);
    this.store.currentIndex.set(newCurrentIndex);
  }
}