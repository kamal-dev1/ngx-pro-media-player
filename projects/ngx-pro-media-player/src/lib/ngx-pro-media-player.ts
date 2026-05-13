import { Component } from '@angular/core';
import { PlayerShell } from './ui/shell/player-shell/player-shell';

@Component({
  selector: 'lib-ngx-pro-media-player',
  imports: [PlayerShell],
  template: ` <media-player></media-player> `,
  styles: ``,
})
export class NgxProMediaPlayer {}
