import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerShell } from './player-shell';

describe('PlayerShell', () => {
  let component: PlayerShell;
  let fixture: ComponentFixture<PlayerShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerShell],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
