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

[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://paypal.me/your-username)