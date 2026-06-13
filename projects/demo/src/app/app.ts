import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MediaItem, NgxMediaPlayer } from 'ngx-pro-media-player';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxMediaPlayer, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly language = signal<'fa' | 'en'>('fa');
  readonly direction = signal<'rtl' | 'ltr'>('rtl');
  readonly panelOpen = signal(false);

  newMedia = {
    title: '',
    artist: '',
    cover: '',
    url: '',
    type: 'audio' as 'audio' | 'video',
  };

  readonly mediaList = signal<MediaItem[]>([
    {
      id: '1',
      title: 'Sample Audio 1',
      artist: 'Demo Artist',
      cover: 'https://picsum.photos/300/300?random=1',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      type: 'audio',
    },
    {
      id: '2',
      title: 'Sample Audio 2',
      artist: 'Demo Artist',
      cover: 'https://picsum.photos/300/300?random=2',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      type: 'audio',
    },
    {
      id: '3',
      title: 'Sample Audio 3 (No Cover)',
      artist: 'Demo Artist',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      type: 'audio',
    },
    {
      id: '4',
      title: 'Big Buck Bunny',
      artist: 'Blender Foundation',
      cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster.jpg/320px-Big_buck_bunny_poster.jpg',
      poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster.jpg/640px-Big_buck_bunny_poster.jpg',
      url: 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4',
      type: 'video',
    },
  ]);

  toggleLanguage(): void {
    const next = this.language() === 'fa' ? 'en' : 'fa';
    this.language.set(next);
    this.direction.set(next === 'fa' ? 'rtl' : 'ltr');
  }

  addMedia(): void {
    if (!this.newMedia.url || !this.newMedia.title) return;
    const item: MediaItem = {
      id: Date.now().toString(),
      title: this.newMedia.title,
      artist: this.newMedia.artist || undefined,
      cover: this.newMedia.cover || undefined,
      url: this.newMedia.url,
      type: this.newMedia.type,
    };
    this.mediaList.update(list => [...list, item]);
    this.newMedia = { title: '', artist: '', cover: '', url: '', type: 'audio' };
    this.panelOpen.set(false);
  }

  removeMedia(id: string): void {
    this.mediaList.update(list => list.filter(i => i.id !== id));
  }
}