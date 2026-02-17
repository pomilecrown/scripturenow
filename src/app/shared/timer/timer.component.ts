import { Component, input } from '@angular/core';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent {
  seconds = input<number>(0);

  formatted(): string {
    const s = this.seconds();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toFixed(1).padStart(4, '0')}` : sec.toFixed(1);
  }
}
