import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SoftwareSelectionService } from '../../services/software-selection.service';
import { ScriptureSoftwareEngine } from '../../core/engines/scripture-software-engine';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(
    public software: SoftwareSelectionService,
    private router: Router
  ) {}

  get engines(): ScriptureSoftwareEngine[] {
    return this.software.engines;
  }

  selectAndGo(engine: ScriptureSoftwareEngine): void {
    this.software.select(engine.id);
    this.router.navigate(['/training']);
  }
}
