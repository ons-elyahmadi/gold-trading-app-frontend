import { Component, OnInit } from '@angular/core';
import { TradingService, Stats } from '../../services/trading.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  countries: { name: string; impact: string }[] = [];
  selectedDays = 7;
  isMonitoring = false;
  monitorDone = false;
  progress = 0;

  readonly dayOptions = [1, 3, 7, 14, 30];

  constructor(public trading: TradingService) {}

  ngOnInit(): void {
    this.trading.getCountries().subscribe((c) => (this.countries = c));
    this.trading.loading$.subscribe((l) => (this.isMonitoring = l));
    this.trading.loadStats();
  }

  startMonitoring(): void {
    this.monitorDone = false;
    this.progress = 0;

    // Simulate progress bar while waiting
    const interval = setInterval(() => {
      if (this.progress < 88) this.progress += Math.random() * 5;
    }, 600);

    this.trading.runMonitoring(this.selectedDays).subscribe({
      next: () => {
        clearInterval(interval);
        this.progress = 100;
        setTimeout(() => (this.monitorDone = true), 400);
      },
      error: () => clearInterval(interval),
    });
  }

  getImpactClass(impact: string): string {
    if (impact.includes('TRÈS ÉLEVÉ')) return 'impact--critical';
    if (impact.includes('ÉLEVÉ'))     return 'impact--high';
    return 'impact--medium';
  }

  statPercent(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }
}
