import { Injectable, signal, computed } from '@angular/core';
import { SessionResult } from '../shared/types/session';

const STORAGE_PREFIX = 'scripture-now-scores-';
const PROFILES_KEY = 'scripture-now-profiles';
const DEFAULT_PROFILE_ID = 'default';

export interface ExportedData {
  profile: string;
  exportedAt: string;
  sessions: SessionResult[];
}

@Injectable({ providedIn: 'root' })
export class ScoresService {
  private currentProfileId = signal<string>(this.loadCurrentProfileId());
  private profilesVersion = signal(0);
  private sessionsVersion = signal(0);

  currentProfile = this.currentProfileId.asReadonly();

  profiles = computed(() => {
    this.profilesVersion();
    const list = this.loadProfileList();
    if (list.length === 0) return [DEFAULT_PROFILE_ID];
    return list;
  });

  sessions = computed(() => {
    this.currentProfileId();
    this.sessionsVersion();
    return this.loadSessions(this.currentProfileId());
  });

  constructor() {
    this.ensureDefaultProfile();
  }

  private loadCurrentProfileId(): string {
    try {
      const id = localStorage.getItem('scripture-now-current-profile');
      return id || DEFAULT_PROFILE_ID;
    } catch {
      return DEFAULT_PROFILE_ID;
    }
  }

  private saveCurrentProfileId(id: string): void {
    this.currentProfileId.set(id);
    try {
      localStorage.setItem('scripture-now-current-profile', id);
    } catch {}
  }

  private loadProfileList(): string[] {
    try {
      const raw = localStorage.getItem(PROFILES_KEY);
      if (!raw) return [DEFAULT_PROFILE_ID];
      const list = JSON.parse(raw) as string[];
      return Array.isArray(list) && list.length > 0 ? list : [DEFAULT_PROFILE_ID];
    } catch {
      return [DEFAULT_PROFILE_ID];
    }
  }

  private saveProfileList(list: string[]): void {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
    } catch {}
  }

  private ensureDefaultProfile(): void {
    const list = this.loadProfileList();
    if (!list.includes(DEFAULT_PROFILE_ID)) {
      this.saveProfileList([DEFAULT_PROFILE_ID, ...list.filter((x) => x !== DEFAULT_PROFILE_ID)]);
    }
  }

  setCurrentProfile(profileId: string): void {
    const list = this.loadProfileList();
    if (!list.includes(profileId)) {
      this.saveProfileList([...list, profileId]);
    }
    this.saveCurrentProfileId(profileId);
  }

  addProfile(name: string): string {
    const list = this.loadProfileList();
    const id = name.trim() || `profile-${Date.now()}`;
    if (!list.includes(id)) {
      this.saveProfileList([...list, id]);
      this.profilesVersion.update((v) => v + 1);
    }
    return id;
  }

  private storageKey(profileId: string): string {
    return `${STORAGE_PREFIX}${profileId}`;
  }

  private loadSessions(profileId: string): SessionResult[] {
    try {
      const raw = localStorage.getItem(this.storageKey(profileId));
      if (!raw) return [];
      const data = JSON.parse(raw) as SessionResult[];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  addSession(result: SessionResult): void {
    const id = this.currentProfileId();
    const sessions = [...this.loadSessions(id), result];
    try {
      localStorage.setItem(this.storageKey(id), JSON.stringify(sessions));
      this.sessionsVersion.update((v) => v + 1);
    } catch {}
  }

  clearSessions(profileId?: string): void {
    const id = profileId ?? this.currentProfileId();
    try {
      localStorage.setItem(this.storageKey(id), JSON.stringify([]));
      this.sessionsVersion.update((v) => v + 1);
    } catch {}
  }

  export(profileId?: string): ExportedData {
    const id = profileId ?? this.currentProfileId();
    const sessions = this.loadSessions(id);
    return {
      profile: id,
      exportedAt: new Date().toISOString(),
      sessions
    };
  }

  exportBlob(profileId?: string): Blob {
    const data = this.export(profileId);
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }

  downloadExport(profileId?: string): void {
    const data = this.export(profileId);
    const blob = this.exportBlob(profileId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scripture-now-scores-${data.profile}-${data.exportedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  import(json: ExportedData, targetProfileId?: string, merge = true): void {
    const targetId = targetProfileId ?? this.currentProfileId();
    const existing = merge ? this.loadSessions(targetId) : [];
    const combined = [...existing, ...json.sessions];
    try {
      localStorage.setItem(this.storageKey(targetId), JSON.stringify(combined));
      this.sessionsVersion.update((v) => v + 1);
    } catch {}
    this.addProfile(json.profile);
  }

  importFromFile(file: File, targetProfileId?: string, merge = true): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string) as ExportedData;
          if (data && Array.isArray(data.sessions)) {
            this.import(data, targetProfileId, merge);
            resolve();
          } else {
            reject(new Error('Invalid format'));
          }
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}
