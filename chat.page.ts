// src/app/pages/chat/chat.page.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';

// Definimos una interfaz para la estructura de los mensajes
interface Message {
  sender: 'user' | 'admin';
  type: 'text' | 'image';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  // ViewChild para acceder al contenido y hacer scroll
  @ViewChild('chatContent', { static: false }) content: IonContent;

  // Estado para simular si el chat fue cerrado por el admin
  isChatClosed = false;

  // Mensajes de ejemplo
  messages: Message[] = [
    {
      sender: 'admin',
      type: 'text',
      content: '¡Hola! 👋 Bienvenido a la Pastelería D\'Diego. ¿En qué podemos ayudarte hoy?',
      timestamp: new Date(new Date().getTime() - 5 * 60000) // hace 5 min
    },
    {
      sender: 'user',
      type: 'text',
      content: 'Hola, quisiera saber si tienen pastel de tres leches disponible.',
      timestamp: new Date(new Date().getTime() - 4 * 60000) // hace 4 min
    },
    {
      sender: 'admin',
      type: 'image',
      content: 'https://via.placeholder.com/300x200.png?text=Pastel+Tres+Leches', // URL de imagen de ejemplo
      timestamp: new Date(new Date().getTime() - 3 * 60000) // hace 3 min
    },
    {
      sender: 'admin',
      type: 'text',
      content: '¡Claro que sí! Así se ve nuestro delicioso pastel de tres leches. ¿Te gustaría ordenar uno?',
      timestamp: new Date(new Date().getTime() - 3 * 60000) // hace 3 min
    }
  ];

  newMessage: string = '';

  constructor() { }

  ngOnInit() {
    // Simula que el chat se cierra después de un tiempo para probar la UI
    // En una app real, esto vendría de un listener de Firestore o una API.
  }

  ionViewDidEnter() {
    this.scrollToBottom();
  }

  /**
   * Envía un nuevo mensaje y lo agrega a la lista.
   */
  sendMessage(event?: any) {
    // Evita que el Enter en desktop cree una nueva línea si se presiona sin Shift
    if (event && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
    } else if (event) {
      return; // Permite nuevas líneas con Shift+Enter
    }

    if (!this.newMessage || this.newMessage.trim() === '') {
      return;
    }

    const userMessage: Message = {
      sender: 'user',
      type: 'text',
      content: this.newMessage.trim(),
      timestamp: new Date(),
    };

    this.messages.push(userMessage);
    this.newMessage = '';

    // Auto-scroll al nuevo mensaje
    this.scrollToBottom(true);

    // Simular respuesta del admin
    this.simulateAdminResponse();
  }

  /**
   * Simula una respuesta automática del administrador.
   */
  simulateAdminResponse() {
    setTimeout(() => {
      const adminResponse: Message = {
        sender: 'admin',
        type: 'text',
        content: 'Hemos recibido tu mensaje. Un asesor te atenderá en breve.',
        timestamp: new Date(),
      };
      this.messages.push(adminResponse);
      this.scrollToBottom(true);
    }, 1500);
  }

  /**
   * Desplaza el contenido del chat hasta el final.
   */
  scrollToBottom(animate = false) {
    setTimeout(() => {
      this.content?.scrollToBottom(animate ? 300 : 0);
    }, 100);
  }

  /**
   * Abre una imagen en un modal o a pantalla completa (simulado).
   */
  openImage(imageUrl: string) {
    console.log('Abriendo imagen:', imageUrl);
    // Aquí podrías implementar un modal para ver la imagen en grande.
  }
}