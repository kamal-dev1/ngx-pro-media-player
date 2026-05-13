import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMediaPlayer } from './ngx-media-player';

describe('PlayerShell', () => {
  let component: NgxMediaPlayer;
  let fixture: ComponentFixture<NgxMediaPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxMediaPlayer],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxMediaPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
