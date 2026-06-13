import { LyricLine } from "./lyric.model";

export interface MediaItem {

    id: string;
  
    title: string;
  
    artist?: string;
  
    album?: string;
  
    cover?: string;
  
    poster?: string;
  
    url: string;
  
    stream?: boolean;
  
    type: 'audio' | 'video';
  
    duration?: number;

    lyrics?: LyricLine[];

    liked?: boolean;

    inPlaylist?: boolean;
  }