import { Injectable, signal, computed } from '@angular/core';

export type PlayerLanguage = 'fa' | 'en';

const translations = {
  fa: {
    queue: 'صف پخش',
    lyrics: 'متن آهنگ',
    speed: 'سرعت',
    shuffle: 'شافل',
    repeat: 'ریپیت',
    mute: 'بی صدا',
    play: 'پخش',
    pause: 'توقف',
    next: 'بعدی',
    previous: 'قبلی',
    mini: 'مینی پلیر',
    close: 'بستن',
    volume: 'صدا',
    like: 'پسندیدن',
    addToPlaylist: 'افزودن به پلی‌لیست',
    download: 'دانلود',
  },
  en: {
    queue: 'Queue',
    lyrics: 'Lyrics',
    speed: 'Speed',
    shuffle: 'Shuffle',
    repeat: 'Repeat',
    mute: 'Mute',
    play: 'Play',
    pause: 'Pause',
    next: 'Next',
    previous: 'Previous',
    mini: 'Mini',
    close: 'Close',
    volume: 'Volume',
    like: 'Like',
    addToPlaylist: 'Add to Playlist',
    download: 'Download',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly language = signal<PlayerLanguage>('fa');

  readonly t = computed(() => translations[this.language()]);

  setLanguage(lang: PlayerLanguage): void {
    this.language.set(lang);
  }
}