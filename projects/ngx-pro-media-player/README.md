# ng-media-player

A lightweight Angular media player with audio, video, queue, crossfade, lyrics, and RTL support — built with Angular Signals, no extra dependencies.

🔴 [Live Demo](https://kamal-dev1.github.io/ngx-pro-media-player/)

---

## Installation

```bash
npm install ngx-pro-media-player @angular/cdk
```

---

## Usage

Import the component:

```typescript
import { NgxMediaPlayer } from 'ngx-pro-media-player';

@Component({
  imports: [NgxMediaPlayer],
})
export class AppComponent {}
```

Add to your template:

```html
<ngx-media-player [mediaList]="tracks" language="en" direction="ltr" />
```

Pass a single track as a one-item array:

```html
<ngx-media-player [mediaList]="[track]" language="en" direction="ltr" />
```

---

## Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `mediaList` | `MediaItem[]` | `[]` | List of tracks / single track |
| `language` | `'en' \| 'fa'` | `'fa'` | UI language |
| `direction` | `'ltr' \| 'rtl'` | `'rtl'` | Text direction |
| `crossfadeSeconds` | `number` | `2.5` | Crossfade duration between tracks (seconds) |

---

## Outputs

| Output | Payload | Description |
|---|---|---|
| `closed` | `void` | Emitted when the user closes the player (close button). Playback is paused automatically; the consumer is responsible for clearing `mediaList` if the player should disappear. |
| `liked` | `MediaItem` | Emitted with the currently playing track when the user clicks the like button and `item.liked` is **not** `true`. The player does not call any API itself — handle the request (e.g. send it to your backend) in your own handler. |
| `unliked` | `MediaItem` | Emitted instead of `liked` when the user clicks the like button while `item.liked` is `true` — i.e. the button acts as a toggle. |
| `addedToPlaylist` | `MediaItem` | Emitted with the currently playing track when the user clicks the "add to playlist" button and `item.inPlaylist` is **not** `true`. The consumer decides what to do (e.g. call an API). |
| `removedFromPlaylist` | `MediaItem` | Emitted instead of `addedToPlaylist` when the user clicks the button while `item.inPlaylist` is `true` — i.e. the button acts as a toggle. |
| `removedFromQueue` | `MediaItem` | Emitted when the user clicks the ✕ on a queue item to remove it. The player removes the item from playback immediately; the consumer should remove it from `mediaList` too so it doesn't get re-added. |

```html
<ngx-media-player
  [mediaList]="tracks"
  language="en"
  direction="ltr"
  (closed)="tracks = []"
  (liked)="onLike($event)"
  (unliked)="onUnlike($event)"
  (addedToPlaylist)="onAddToPlaylist($event)"
  (removedFromPlaylist)="onRemoveFromPlaylist($event)"
  (removedFromQueue)="onRemoveFromQueue($event)"
/>
```

```typescript
onLike(track: MediaItem): void {
  this.http.post('/api/likes', { trackId: track.id }).subscribe(() => {
    track.liked = true;
  });
}

onUnlike(track: MediaItem): void {
  this.http.delete(`/api/likes/${track.id}`).subscribe(() => {
    track.liked = false;
  });
}

onAddToPlaylist(track: MediaItem): void {
  this.http.post('/api/playlists/current/items', { trackId: track.id }).subscribe(() => {
    track.inPlaylist = true;
  });
}

onRemoveFromPlaylist(track: MediaItem): void {
  this.http.delete(`/api/playlists/current/items/${track.id}`).subscribe(() => {
    track.inPlaylist = false;
  });
}

onRemoveFromQueue(track: MediaItem): void {
  this.tracks = this.tracks.filter(t => t.id !== track.id);
}
```

> Note: the player **hides itself automatically** whenever `mediaList` is empty — there's no separate "visible" flag.

---

## MediaItem

```typescript
interface MediaItem {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  cover?: string;
  poster?: string;       // video poster
  url: string;
  type: 'audio' | 'video';
  duration?: number;
  lyrics?: LyricLine[];
  liked?: boolean;        // mark as already liked — hides the liked action / shows it as active
  inPlaylist?: boolean;   // mark as already in playlist — hides the add action / shows it as active
}

interface LyricLine {
  time: number;          // seconds
  text: string;
}
```

---

## Example

```typescript
const tracks: MediaItem[] = [
  {
    id: '1',
    title: 'Track One',
    artist: 'Artist A',
    cover: 'https://example.com/cover.jpg',
    url: 'https://example.com/track1.mp3',
    type: 'audio',
  },
  {
    id: '2',
    title: 'My Video',
    url: 'https://example.com/video.mp4',
    poster: 'https://example.com/poster.jpg',
    type: 'video',
  },
];
```

---

## Features

- 🎵 Audio & 🎬 Video playback
- 🔀 Shuffle & 🔁 Repeat (off / all / one)
- ⏭ Queue with drag-and-drop reorder
- 🌊 Crossfade between tracks
- 📜 Lyrics panel
- 🌐 RTL & LTR support
- 📶 Buffer progress bar
- ⌨️ Media Session API (OS lock screen controls)

---

## Support

If this project saved you some time, consider buying me a coffee ☕

