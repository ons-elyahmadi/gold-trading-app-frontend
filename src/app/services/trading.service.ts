import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Alert {
  id: string;
  timestamp: string;
  country: string;
  impact: string;
  title: string;
  source: string;
  url: string;
  priority: 'CRITIQUE' | 'ÉLEVÉE' | 'MOYEN' | 'BAS';
  analysis: {
    severite: string;
    safe_haven: string;
    prix_or: string;
    action: string;
    resume: string;
    raw: string;
  };
}

export interface Stats {
  total: number;
  critique: number;
  elevee: number;
  moyen: number;
  bas: number;
  buy_signals: number;
  sell_signals: number;
  wait_signals: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class TradingService {
  private readonly API = 'http://localhost:5000/api';

  private _alerts$ = new BehaviorSubject<Alert[]>([]);
  private _stats$  = new BehaviorSubject<Stats | null>(null);
  private _loading$ = new BehaviorSubject<boolean>(false);

  alerts$  = this._alerts$.asObservable();
  stats$   = this._stats$.asObservable();
  loading$ = this._loading$.asObservable();

  constructor(private http: HttpClient) {}

  // ── Health ──────────────────────────────────────────────────
  health(): Observable<any> {
    return this.http.get(`${this.API}/health`);
  }

  // ── Countries ───────────────────────────────────────────────
  getCountries(): Observable<{ name: string; impact: string }[]> {
    return this.http.get<{ name: string; impact: string }[]>(`${this.API}/countries`);
  }

  // ── Monitoring ──────────────────────────────────────────────
  runMonitoring(days = 7): Observable<{ alerts: Alert[]; count: number }> {
    this._loading$.next(true);
    const obs = this.http.post<{ alerts: Alert[]; count: number }>(
      `${this.API}/monitor`, { days }
    );
    obs.subscribe({
      next: (res) => {
        this._alerts$.next(res.alerts);
        this._loading$.next(false);
        this.loadStats();
      },
      error: () => this._loading$.next(false),
    });
    return obs;
  }

  // ── Alerts ──────────────────────────────────────────────────
  getAlerts(country?: string): Observable<{ alerts: Alert[]; count: number }> {
    const url = country
      ? `${this.API}/alerts?country=${encodeURIComponent(country)}`
      : `${this.API}/alerts`;
    return this.http.get<{ alerts: Alert[]; count: number }>(url);
  }

  // ── Stats ───────────────────────────────────────────────────
  loadStats(): void {
    this.http.get<Stats>(`${this.API}/stats`).subscribe({
      next: (s) => this._stats$.next(s),
    });
  }

  // ── Chat ─────────────────────────────────────────────────────
  chat(question: string, history: ChatMessage[]): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(`${this.API}/chat`, {
      question,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    });
  }

  // ── Export ───────────────────────────────────────────────────
  exportAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.API}/alerts/export`);
  }

  // ── Helpers ──────────────────────────────────────────────────
  getPriorityColor(p: string): string {
    const map: Record<string, string> = {
      CRITIQUE: '#e74c3c',
      'ÉLEVÉE': '#f39c12',
      MOYEN:    '#c9a84c',
      BAS:      '#27ae60',
    };
    return map[p] ?? '#888';
  }

  getActionColor(action: string): string {
    if (action.includes('BUY'))  return '#27ae60';
    if (action.includes('SELL')) return '#e74c3c';
    return '#c9a84c';
  }
}
