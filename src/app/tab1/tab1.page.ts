import { Component, OnInit } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput
} from '@ionic/angular/standalone';

import { FirestoreService } from '../services/firestore.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, 
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonInput,
    CommonModule, FormsModule
  ],
})
export class Tab1Page implements OnInit {
  items: any[] = [];
  newItemName: string = '';
  connectionStatus: string = 'Conectando...';

  constructor(private firestoreService: FirestoreService) {}

  async ngOnInit() {
    await this.loadItems();
  }

  async loadItems() {
    try {
      const result = await this.firestoreService.readAll('test-items');
      if (result.success) {
        this.items = result.data || [];
        this.connectionStatus = '✅ Conectado a Firebase';
      } else {
        this.connectionStatus = '❌ Error: ' + result.error;
      }
    } catch (error) {
      this.connectionStatus = '❌ Error de conexión: ' + error;
    }
  }

  async addItem() {
    if (this.newItemName.trim()) {
      const result = await this.firestoreService.create('test-items', {
        name: this.newItemName,
        timestamp: new Date()
      });
      
      if (result.success) {
        this.newItemName = '';
        await this.loadItems();
      } else {
        console.error('Error adding item:', result.error);
      }
    }
  }

  async deleteItem(id: string) {
    const result = await this.firestoreService.delete('test-items', id);
    if (result.success) {
      await this.loadItems();
    }
  }
}
