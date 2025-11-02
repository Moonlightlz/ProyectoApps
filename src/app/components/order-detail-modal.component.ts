import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonImg,
  IonBadge,
  ModalController
} from '@ionic/angular/standalone';
import { Order, OrderStatusLabels, OrderStatusColors } from '../models/order.model';
import { addIcons } from 'ionicons';
import { 
  closeOutline,
  timeOutline,
  personOutline,
  callOutline,
  mailOutline,
  locationOutline,
  receiptOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-order-detail-modal',
  templateUrl: './order-detail-modal.component.html',
  styleUrls: ['./order-detail-modal.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonImg,
    IonBadge,
    CommonModule
  ]
})
export class OrderDetailModalComponent implements OnInit {
  @Input() order!: Order;

  OrderStatusLabels = OrderStatusLabels;
  OrderStatusColors = OrderStatusColors;

  constructor(private modalController: ModalController) {
    addIcons({
      closeOutline,
      timeOutline,
      personOutline,
      callOutline,
      mailOutline,
      locationOutline,
      receiptOutline,
      checkmarkCircleOutline
    });
  }

  ngOnInit() {
    console.log('Modal de detalle del pedido:', this.order);
    console.log('Customer Info:', this.order.customerInfo);
    console.log('Teléfono:', this.order.customerInfo.phone);
  }

  dismiss() {
    this.modalController.dismiss();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
