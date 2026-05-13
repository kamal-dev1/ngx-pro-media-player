import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  MediaItem,
  PlayerShell
} from 'ngx-pro-media-player';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,PlayerShell],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('demo');

  readonly mediaList: MediaItem[] = [
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
      title: 'نمونه ویدیو (Big Buck Bunny)',
      artist: 'Blender Foundation',
      cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster.jpg/320px-Big_buck_bunny_poster.jpg',
      poster:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster.jpg/640px-Big_buck_bunny_poster.jpg',
      url: 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4',
      type: 'video',
    },
  ];
}
