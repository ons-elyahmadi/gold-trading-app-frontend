import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';

import { TradingService, ChatMessage } from '../../services/trading.service';
import jsPDF from 'jspdf';

const SUGGESTED_QUESTIONS = [
  "Quel est l'impact actuel des tensions géopolitiques sur l'or ?",
  "Dois-je acheter de l'or maintenant selon les alertes ?",
  "Quels pays présentent le plus grand risque pour le prix de l'or ?",
  "Explique-moi le concept de safe-haven demand pour l'or",
  "Quel est le signal dominant BUY ou SELL en ce moment ?",
  "Comment la politique de la Fed influence-t-elle le cours de l'or ?",
];

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {

  @ViewChild('messagesContainer') private msgContainer!: ElementRef;

  messages: ChatMessage[] = [];
  inputText = '';
  isTyping = false;

  suggestions = SUGGESTED_QUESTIONS;
  showSuggestions = true;

  constructor(private trading: TradingService) {}

  ngOnInit(): void {
    this.messages.push({
      role: 'assistant',
      content:
        "✦ Bonjour ! Je suis votre analyste IA spécialisé en trading d'or. " +
        "Comment puis-je vous aider ?",
      timestamp: new Date(),
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom(true);
  }

  // -------------------------------
  // 🔥 SMART SCROLL SYSTEM
  // -------------------------------

  private isUserAtBottom(): boolean {
    const el = this.msgContainer?.nativeElement;
    if (!el) return true;

    return el.scrollHeight - el.scrollTop <= el.clientHeight + 80;
  }

  private scrollToBottom(force = false): void {
    try {
      const el = this.msgContainer.nativeElement;

      if (force || this.isUserAtBottom()) {
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        }, 50);
      }
    } catch {}
  }

  // -------------------------------
  // SEND MESSAGE
  // -------------------------------

  send(text?: string): void {
    const q = (text ?? this.inputText).trim();
    if (!q || this.isTyping) return;

    this.showSuggestions = false;
    this.inputText = '';

    // user message
    this.messages.push({
      role: 'user',
      content: q,
      timestamp: new Date(),
    });

    this.scrollToBottom(true);

    this.isTyping = true;

    this.trading.chat(q, this.messages).subscribe({
      next: (res) => {
        this.messages.push({
          role: 'assistant',
          content: res.response,
          timestamp: new Date(),
        });

        this.isTyping = false;

        this.scrollToBottom();
      },

      error: () => {
        this.messages.push({
          role: 'assistant',
          content: '❌ Erreur serveur Flask.',
          timestamp: new Date(),
        });

        this.isTyping = false;

        this.scrollToBottom();
      },
    });
  }

  // -------------------------------
  // INPUT HANDLER
  // -------------------------------

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  // -------------------------------
  // CLEAR CHAT
  // -------------------------------

  clearChat(): void {
    this.messages = [this.messages[0]];
    this.showSuggestions = true;

    this.scrollToBottom(true);
  }

  // -------------------------------
  // FORMAT MESSAGE
  // -------------------------------

  formatContent(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  // -------------------------------
  // EXPORT PDF
  // -------------------------------

  exportChatToPDF() {
    const doc = new jsPDF();

    const date = new Date().toLocaleString();

    doc.setFontSize(16);
    doc.text("AurumWatch - Historique Chat IA", 10, 15);

    doc.setFontSize(10);
    doc.text(`Exporté le : ${date}`, 10, 22);

    let y = 30;

    this.messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'Utilisateur' : 'Aurum AI';
      const text = `${role}:\n${msg.content}`;

      const splitText = doc.splitTextToSize(text, 180);

      if (y > 270) {
        doc.addPage();
        y = 10;
      }

      doc.text(splitText, 10, y);
      y += splitText.length * 6;
    });

    doc.save(`AurumWatch_Chat_${Date.now()}.pdf`);
  }
}