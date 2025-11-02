import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { 
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonInput,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.page.html',
  styleUrls: ['./conversation.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonInput,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule
  ]
})
export class ConversationPage implements OnInit {
  public conversationId: string | null = null;
  public messages: any[] = [];
  public newMessageText: string = '';

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.conversationId = this.route.snapshot.paramMap.get('id');
    if (this.conversationId) {
      await this.loadMessages();
    }
  }

  async loadMessages() {
    if (!this.conversationId) return;
    const res = await this.chatService.getMessages(this.conversationId);
    if (res && res.success) {
      this.messages = res.data as any[];
    }
  }

  formatDate(d: any) {
    if (!d) return '';
    // Firestore Timestamp may have toDate()
    try {
      return d.toDate ? d.toDate().toLocaleString() : new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  }

  async sendMessage() {
    if (!this.conversationId || !this.newMessageText.trim()) return;
    const currentUser = this.authService.getCurrentUser();
    const uid = currentUser?.uid || 'anonymous';
    await this.chatService.sendMessage(this.conversationId, uid, this.newMessageText.trim());
    this.newMessageText = '';
    await this.loadMessages();
  }

  isCurrentUser(senderId: string): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.uid === senderId;
  }
}
