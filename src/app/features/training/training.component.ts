import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoiceService } from '../../services/voice.service';
import { SessionService } from '../../services/session.service';
import { SoftwareSelectionService } from '../../services/software-selection.service';
import { TimerComponent } from '../../shared/timer/timer.component';
import { ScriptureFormValueThree } from '../../core/engines/scripture-software-engine';
import { Difficulty } from '../../shared/types/verse';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [DecimalPipe, FormsModule, TimerComponent],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss'
})
export class TrainingComponent implements OnInit {
  voices = signal<{ id: string; label: string }[]>([]);
  voiceId = signal('');
  difficulty = signal<Difficulty>('easy');
  count = signal(10);
  skipOnWrong = signal(true);

  book = signal('');
  chapter = signal('');
  verse = signal('');
  singleLine = signal('');

  constructor(
    private voiceService: VoiceService,
    public session: SessionService,
    public software: SoftwareSelectionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.voiceService.getVoices().subscribe((v) => {
      this.voices.set(v);
      if (v.length && !this.voiceId()) this.voiceId.set(v[0].id);
    });
  }

  get state() {
    return this.session.sessionState();
  }

  get currentVerse() {
    return this.session.currentVerse();
  }

  get engine() {
    return this.software.selectedEngine();
  }

  get isThreeFields(): boolean {
    return this.engine?.inputType === 'threeFields';
  }

  get elapsedSeconds(): number {
    return this.session.elapsedSeconds();
  }

  startSession(): void {
    if (!this.engine) {
      this.router.navigate(['/']);
      return;
    }
    const n = Math.max(1, Math.floor(Number(this.count()) || 10));
    this.session.startSession(
      (this.voiceId() || this.voices()[0]?.id) ?? 'sarah',
      this.difficulty(),
      n,
      this.skipOnWrong()
    );
  }

  endSession(): void {
    const result = this.session.endSession();
    if (result) this.router.navigate(['/results']);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submit();
  }

  submit(): void {
    if (!this.engine || !this.currentVerse) return;
    const input: ScriptureFormValueThree | string = this.isThreeFields
      ? { book: this.book(), chapter: this.chapter(), verse: this.verse() }
      : this.singleLine();
    const outcome = this.session.submitAnswer(input);
    if (outcome.kind === 'ended') {
      this.clearInput();
      this.router.navigate(['/results']);
      return;
    }
    if (outcome.kind === 'advanced') this.clearInput();
  }

  private clearInput(): void {
    this.book.set('');
    this.chapter.set('');
    this.verse.set('');
    this.singleLine.set('');
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    }
  }

  goToHistory(): void {
    this.router.navigate(['/history']);
  }
}
