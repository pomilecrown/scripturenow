import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { ScoresService } from '../../services/scores.service';
import { SessionResult } from '../../shared/types/session';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit {
  result = signal<SessionResult | null>(null);

  constructor(
    private session: SessionService,
    private scores: ScoresService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const last = this.session.lastResult();
    if (last) {
      this.result.set(last);
      this.scores.addSession(last);
      this.session.lastResult.set(null);
    }
  }

  get res(): SessionResult | null {
    return this.result();
  }

  done(): void {
    this.router.navigate(['/training']);
  }

  myScores(): void {
    this.router.navigate(['/history']);
  }
}
