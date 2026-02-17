import { Injectable, signal, computed } from '@angular/core';
import { ScriptureSoftwareEngine } from '../core/engines/scripture-software-engine';
import { getEngineById, ENGINE_REGISTRY } from '../core/engines/engine-registry';

const STORAGE_KEY = 'scripture-now-selected-software-id';

@Injectable({ providedIn: 'root' })
export class SoftwareSelectionService {
  private selectedId = signal<string | null>(this.loadStoredId());

  selectedEngine = computed(() => {
    const id = this.selectedId();
    return id ? getEngineById(id) ?? null : null;
  });

  get engines(): ScriptureSoftwareEngine[] {
    return ENGINE_REGISTRY;
  }

  select(id: string): void {
    if (getEngineById(id)) {
      this.selectedId.set(id);
      try {
        localStorage.setItem(STORAGE_KEY, id);
      } catch {}
    }
  }

  private loadStoredId(): string | null {
    try {
      const id = localStorage.getItem(STORAGE_KEY);
      return id && getEngineById(id) ? id : null;
    } catch {
      return null;
    }
  }
}
