import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Voice } from '../shared/types/voice';

@Injectable({ providedIn: 'root' })
export class VoiceService {
  private voices$: Observable<Voice[]>;

  constructor(private http: HttpClient) {
    this.voices$ = this.http.get<Voice[]>('assets/data/voices.json').pipe(shareReplay(1));
  }

  getVoices(): Observable<Voice[]> {
    return this.voices$;
  }
}
