import { Component, OnInit } from '@angular/core';
import { TradingService, Alert } from '../../services/trading.service';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss'],
})
export class AlertsComponent implements OnInit {
  alerts: Alert[] = [];
  filteredAlerts: Alert[] = [];
  countries: string[] = [];
  selectedCountry = '';
  selectedPriority = '';
  selectedAction   = '';
  expandedId: string | null = null;
  isLoading = false;

  readonly priorities = ['', 'CRITIQUE', 'ÉLEVÉE', 'MOYEN', 'BAS'];
  readonly actions    = ['', 'BUY GOLD', 'SELL GOLD', 'WAIT'];

  constructor(public trading: TradingService) {}

  ngOnInit(): void {
    this.trading.alerts$.subscribe((a) => {
      this.alerts = a;
      this.extractCountries(a);
      this.applyFilters();
    });

    this.isLoading = true;
    this.trading.getAlerts().subscribe({
      next: (res) => {
        this.alerts = res.alerts;
        this.extractCountries(res.alerts);
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  extractCountries(alerts: Alert[]): void {
    this.countries = ['', ...new Set(alerts.map((a) => a.country))];
  }

  applyFilters(): void {
    this.filteredAlerts = this.alerts.filter((a) => {
      const matchCountry   = !this.selectedCountry  || a.country  === this.selectedCountry;
      const matchPriority  = !this.selectedPriority || a.priority === this.selectedPriority;
      const matchAction    = !this.selectedAction   || a.analysis.action.includes(this.selectedAction);
      return matchCountry && matchPriority && matchAction;
    });
  }

  toggleExpand(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  priorityClass(p: string): string {
    const map: Record<string, string> = {
      CRITIQUE: 'badge--critique',
      'ÉLEVÉE': 'badge--elevee',
      MOYEN:    'badge--moyen',
      BAS:      'badge--bas',
    };
    return map[p] ?? '';
  }

  actionClass(action: string): string {
    if (action.includes('BUY'))  return 'badge--buy';
    if (action.includes('SELL')) return 'badge--sell';
    return 'badge--wait';
  }

  priceClass(prix: string): string {
    if (prix === 'hausse') return 'price--up';
    if (prix === 'baisse') return 'price--down';
    return 'price--neutral';
  }

  exportJSON(): void {
    this.trading.exportAlerts().subscribe((data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `aurum-alerts-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  trackById(_: number, a: Alert) { return a.id; }
}
