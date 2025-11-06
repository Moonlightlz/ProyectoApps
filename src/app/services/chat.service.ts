import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, query, where, onSnapshot, orderBy, Timestamp, getDocs, writeBatch, getDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { ChatMessage, ChatConversation, UnreadCount } from '../models/chat.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private unreadCountSubject = new BehaviorSubject<UnreadCount>({ total: 0, byOrder: {} });
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private unsubscribeMessages: (() => void) | null = null;
  private unsubscribeUnreadCount: (() => void) | null = null;

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {
    this.initializeUnreadCountListener();
  }

  /**
   * Inicializar listener de mensajes no leídos
   */
  private initializeUnreadCountListener() {
    setTimeout(() => {
      const user = this.authService.getCurrentUser();
      if (!user) return;

      // Determinar si es admin
      const adminEmails = ['admin@pasteleria.com', 'diego@pasteleria-diego.com'];
      const isAdmin = adminEmails.includes(user.email || '');

      const conversationsRef = collection(this.firestore, 'chatConversations');
      let q;

      if (isAdmin) {
        // Admin ve todas las conversaciones
        q = query(conversationsRef);
      } else {
        // Usuario solo ve sus conversaciones
        q = query(conversationsRef, where('userId', '==', user.uid));
      }

      this.unsubscribeUnreadCount = onSnapshot(q, (snapshot) => {
        let total = 0;
        const byOrder: { [orderId: string]: number } = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          const unreadCount = isAdmin ? (data['unreadCountAdmin'] || 0) : (data['unreadCountUser'] || 0);
          
          if (unreadCount > 0) {
            total += unreadCount;
            byOrder[data['orderId']] = unreadCount;
          }
        });

        this.unreadCountSubject.next({ total, byOrder });
        console.log('💬 Mensajes no leídos:', total);
      });
    }, 500);
  }

  /**
   * Obtener o crear conversación para un pedido
   */
  async getOrCreateConversation(orderId: string, orderCode: string, userId: string, userName: string, userEmail: string): Promise<string> {
    try {
      const conversationsRef = collection(this.firestore, 'chatConversations');
      const q = query(conversationsRef, where('orderId', '==', orderId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }

      // Crear nueva conversación
      const newConversation = {
        orderId,
        orderCode,
        userId,
        userName,
        userEmail,
        lastMessage: '',
        lastMessageTime: Timestamp.fromDate(new Date()),
        unreadCountUser: 0,
        unreadCountAdmin: 0,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      const docRef = await addDoc(conversationsRef, newConversation);
      console.log('💬 Conversación creada:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error obteniendo/creando conversación:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje
   */
  async sendMessage(
    orderId: string,
    orderCode: string,
    message: string,
    recipientUserId?: string,
    recipientName?: string,
    recipientEmail?: string
  ): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) throw new Error('Usuario no autenticado');

      const adminEmails = ['admin@pasteleria.com', 'diego@pasteleria-diego.com'];
      const isAdmin = adminEmails.includes(user.email || '');

      // Obtener o crear conversación
      const conversationId = await this.getOrCreateConversation(
        orderId,
        orderCode,
        recipientUserId || user.uid,
        recipientName || user.displayName || 'Usuario',
        recipientEmail || user.email || ''
      );

      // Crear mensaje
      const newMessage = {
        orderId,
        orderCode,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Usuario',
        senderEmail: user.email || '',
        isAdmin,
        message: message.trim(),
        timestamp: Timestamp.fromDate(new Date()),
        read: false
      };

      const messagesRef = collection(this.firestore, `chatConversations/${conversationId}/messages`);
      console.log('💬 Enviando mensaje a conversación:', conversationId);
      console.log('💬 Datos del mensaje:', newMessage);
      // Optimistic UI: añadir mensaje localmente para que el usuario lo vea instantáneamente
      try {
        const current = this.messagesSubject.getValue() || [];
        const optimisticMsg = {
          id: `local-${Date.now()}`,
          orderId: newMessage.orderId,
          orderCode: newMessage.orderCode,
          senderId: newMessage.senderId,
          senderName: newMessage.senderName,
          senderEmail: newMessage.senderEmail,
          isAdmin: newMessage.isAdmin,
          message: newMessage.message,
          timestamp: new Date(),
          read: false
        };
        this.messagesSubject.next([...current, optimisticMsg]);
      } catch (e) {
        console.warn('No se pudo añadir optimistic message al subject:', e);
      }

      const docRef = await addDoc(messagesRef, newMessage);
      console.log('💬 Mensaje guardado con ID:', docRef.id);

      // Actualizar conversación
      const conversationRef = doc(this.firestore, `chatConversations/${conversationId}`);
      const conversationSnap = await getDoc(conversationRef);
      const conversationData = conversationSnap.data();

      const updateData: any = {
        lastMessage: message.trim(),
        lastMessageTime: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Incrementar contador de no leídos del destinatario
      if (isAdmin) {
        updateData.unreadCountUser = (conversationData?.['unreadCountUser'] || 0) + 1;
      } else {
        updateData.unreadCountAdmin = (conversationData?.['unreadCountAdmin'] || 0) + 1;
      }

      await updateDoc(conversationRef, updateData);
      console.log('💬 Mensaje enviado y conversación actualizada');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  }

  /**
   * Cargar mensajes de un pedido
   */
  loadMessages(orderId: string): void {
    try {
      const conversationsRef = collection(this.firestore, 'chatConversations');
      const q = query(conversationsRef, where('orderId', '==', orderId));
      
      getDocs(q).then(snapshot => {
        if (snapshot.empty) {
          console.log('💬 No hay conversación para este pedido');
          this.messagesSubject.next([]);
          return;
        }

        const conversationId = snapshot.docs[0].id;
        console.log('💬 Escuchando mensajes de conversación:', conversationId);
        // Escuchar mensajes ordenados por timestamp para recibirlos en el orden correcto
        const messagesQuery = query(collection(this.firestore, `chatConversations/${conversationId}/messages`), orderBy('timestamp', 'asc'));

        // includeMetadataChanges ayuda a detectar si los datos vienen de cache / hay writes pendientes
        this.unsubscribeMessages = onSnapshot(messagesQuery, { includeMetadataChanges: true } as any, (messagesSnapshot: any) => {
          console.log('💬 Snapshot de mensajes recibido, cantidad:', messagesSnapshot.size, 'fromCache:', messagesSnapshot.metadata?.fromCache, 'hasPendingWrites:', messagesSnapshot.metadata?.hasPendingWrites);
          const messages: ChatMessage[] = [];

          messagesSnapshot.forEach((doc: any) => {
            const data = doc.data();
            console.log('💬 Mensaje leído:', doc.id, data);
            messages.push({
              id: doc.id,
              orderId: data['orderId'],
              orderCode: data['orderCode'],
              senderId: data['senderId'],
              senderName: data['senderName'],
              senderEmail: data['senderEmail'],
              isAdmin: data['isAdmin'],
              message: data['message'],
              timestamp: data['timestamp']?.toDate(),
              read: data['read']
            });
          });

          messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          console.log('💬 Emitiendo mensajes al subject:', messages.length);
          // Simple dedupe: eliminar mensajes locales optimistas si ya existen en snapshot
          try {
            const current = this.messagesSubject.getValue() || [];
            const optimistic = current.filter(m => m.id && String(m.id).startsWith('local-'));
            if (optimistic.length > 0) {
              // eliminar optimistics que coincidan por texto y sender
              const filtered = messages.filter(serverMsg => !optimistic.some(opt => opt.senderId === serverMsg.senderId && opt.message === serverMsg.message));
              this.messagesSubject.next(filtered);
            } else {
              this.messagesSubject.next(messages);
            }
          } catch (e) {
            this.messagesSubject.next(messages);
          }
        });
      });
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  async markAsRead(orderId: string): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) return;

      const adminEmails = ['admin@pasteleria.com', 'diego@pasteleria-diego.com'];
      const isAdmin = adminEmails.includes(user.email || '');

      const conversationsRef = collection(this.firestore, 'chatConversations');
      const q = query(conversationsRef, where('orderId', '==', orderId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return;

      const conversationId = snapshot.docs[0].id;
      const conversationRef = doc(this.firestore, `chatConversations/${conversationId}`);

      const updateData: any = { updatedAt: Timestamp.fromDate(new Date()) };
      if (isAdmin) {
        updateData.unreadCountAdmin = 0;
      } else {
        updateData.unreadCountUser = 0;
      }

      await updateDoc(conversationRef, updateData);
      console.log('💬 Mensajes marcados como leídos');
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  }

  /**
   * Crear conversación para admin (pedidos personalizados)
   */
  async createConversationForAdmin(userId: string, orderId: string): Promise<{ success: boolean; id?: string }> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar si ya existe una conversación para este pedido
      const conversationsRef = collection(this.firestore, 'chatConversations');
      const q = query(conversationsRef, where('orderId', '==', orderId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Ya existe una conversación
        return { success: true, id: querySnapshot.docs[0].id };
      }

      // Crear nueva conversación
      const now = Timestamp.fromDate(new Date());
      const conversationData = {
        orderId,
        orderCode: orderId === 'custom_order' ? 'Pedido Personalizado' : orderId,
        userId: user.uid,
        userName: user.displayName || user.email || 'Usuario',
        userEmail: user.email || '',
        lastMessage: '',
        lastMessageTime: now,
        unreadCountUser: 0,
        unreadCountAdmin: 0,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(conversationsRef, conversationData);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creando conversación para admin:', error);
      return { success: false };
    }
  }

  /**
   * Limpiar listeners
   */
  unsubscribe(): void {
    if (this.unsubscribeMessages) {
      this.unsubscribeMessages();
      this.unsubscribeMessages = null;
    }
    if (this.unsubscribeUnreadCount) {
      this.unsubscribeUnreadCount();
      this.unsubscribeUnreadCount = null;
    }
  }
}
