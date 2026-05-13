import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxProMediaPlayer } from './ngx-pro-media-player';

describe('NgxProMediaPlayer', () => {
  let component: NgxProMediaPlayer;
  let fixture: ComponentFixture<NgxProMediaPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxProMediaPlayer],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxProMediaPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
