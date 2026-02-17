import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { Verse, Difficulty } from '../shared/types/verse';

@Injectable({ providedIn: 'root' })
export class VerseService {
  private verses$: Observable<Verse[]>;

  constructor(private http: HttpClient) {
    this.verses$ = this.http.get<Verse[]>('assets/data/verses.json').pipe(shareReplay(1));
  }

  getAllVerses(): Observable<Verse[]> {
    return this.verses$;
  }

  getVersesByDifficulty(difficulty: Difficulty): Observable<Verse[]> {
    return this.verses$.pipe(
      map((verses) => verses.filter((v) => v.difficulty === difficulty))
    );
  }

  /** Build a session list of N verses by difficulty; loops from pool if count > available. */
  getSessionVerses(difficulty: Difficulty, count: number): Observable<Verse[]> {
    return this.getVersesByDifficulty(difficulty).pipe(
      map((pool) => {
        if (pool.length === 0) return [];
        const result: Verse[] = [];
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        for (let i = 0; i < count; i++) {
          result.push(shuffled[i % shuffled.length]);
        }
        return result;
      })
    );
  }

  getVerseById(id: string): Observable<Verse | undefined> {
    return this.verses$.pipe(
      map((verses) => verses.find((v) => v.id === id))
    );
  }
}
