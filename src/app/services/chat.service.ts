import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, getDocs, query, orderBy } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private firestore: Firestore) {}

  /**
   * Crear una conversación orientada a atención/administrador
   */
  async createConversationForAdmin(userUid: string, type: string = 'custom_order') {
    try {
      const convRef = await addDoc(collection(this.firestore, 'conversations'), {
        participants: [userUid],
        type,
        targetRole: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, id: convRef.id };
    } catch (error: any) {
      console.error('ChatService.createConversation error', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar mensaje dentro de una conversación
   */
  async sendMessage(conversationId: string, senderId: string, text: string) {
    try {
      const messagesRef = collection(this.firestore, `conversations/${conversationId}/messages`);
      const msgRef = await addDoc(messagesRef, {
        senderId,
        text,
        createdAt: new Date(),
        // Estado de visto por administrador
        seenByAdmin: false,
        seenAtAdmin: null
      });

      // Actualizar metadatos de la conversación
      const convDoc = doc(this.firestore, 'conversations', conversationId);
      await updateDoc(convDoc, {
        lastMessage: text,
        lastMessageAt: new Date(),
        updatedAt: new Date()
      });

      return { success: true, id: msgRef.id };
    } catch (error: any) {
      console.error('ChatService.sendMessage error', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener mensajes de una conversación (ordenados)
   */
  async getMessages(conversationId: string) {
    try {
      const messagesRef = collection(this.firestore, `conversations/${conversationId}/messages`);
      const q = query(messagesRef, orderBy('createdAt'));
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return { success: true, data: messages };
    } catch (error: any) {
      console.error('ChatService.getMessages error', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Marcar mensaje como visto por el admin (backend)
   */
  async markMessageSeenByAdmin(conversationId: string, messageId: string) {
    try {
      const msgDoc = doc(this.firestore, `conversations/${conversationId}/messages`, messageId);
      await updateDoc(msgDoc, {
        seenByAdmin: true,
        seenAtAdmin: new Date()
      });
      return { success: true };
    } catch (error: any) {
      console.error('ChatService.markMessageSeenByAdmin error', error);
      return { success: false, error: error.message };
    }
  }
}
