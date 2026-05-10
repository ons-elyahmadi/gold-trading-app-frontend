import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent }       from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AlertsComponent }    from './components/alerts/alerts.component';
import { ChatComponent }      from './components/chat/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    AlertsComponent,
    ChatComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
