import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ScoresService } from '../../services/scores.service';
import { SessionResult } from '../../shared/types/session';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  importError = signal<string | null>(null);
  importTargetProfile = signal<string | null>(null);
  newProfileName = signal('');

  constructor(
    public scores: ScoresService,
    private router: Router
  ) {}

  get sessions(): SessionResult[] {
    return this.scores.sessions();
  }

  get profiles(): string[] {
    return this.scores.profiles();
  }

  get currentProfile(): string {
    return this.scores.currentProfile();
  }

  setProfile(id: string): void {
    this.scores.setCurrentProfile(id);
  }

  addProfile(): void {
    const name = this.newProfileName().trim();
    if (!name) return;
    const id = this.scores.addProfile(name);
    this.scores.setCurrentProfile(id);
    this.newProfileName.set('');
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  export(): void {
    this.scores.downloadExport();
  }

  reset(): void {
    if (confirm('Clear all scores for this profile?')) {
      this.scores.clearSessions();
    }
  }

  onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    this.importError.set(null);
    if (!file) return;
    const targetProfile = this.importTargetProfile() ?? this.currentProfile;
    this.scores.importFromFile(file, targetProfile, true).then(
      () => {},
      (err) => this.importError.set(err?.message || 'Import failed')
    );
  }

  done(): void {
    this.router.navigate(['/training']);
  }
}
