import { Component, OnInit } from '@angular/core';
import { TradingService } from './services/trading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  activeTab: 'dashboard' | 'alerts' | 'chat' = 'dashboard';
  currentTime = new Date();

  constructor(public trading: TradingService) {}

  ngOnInit(): void {
    setInterval(() => (this.currentTime = new Date()), 1000);
    this.trading.loadStats();
  }

  setTab(tab: 'dashboard' | 'alerts' | 'chat') {
    this.activeTab = tab;
  }
}
