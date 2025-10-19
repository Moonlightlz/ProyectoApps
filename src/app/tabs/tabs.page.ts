import { Component, EnvironmentInjector, inject, OnInit, OnDestroy } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { home, storefront, receipt, chatbubbles, basket, person } from 'ionicons/icons';
import { CartService } from '../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, CommonModule],
})
export class TabsPage implements OnInit, OnDestroy {
  public environmentInjector = inject(EnvironmentInjector);
  cartItemsCount = 0;
  private cartSubscription: Subscription | null = null;

  constructor(private cartService: CartService) {
    addIcons({ home, storefront, receipt, chatbubbles, basket, person });
  }

  ngOnInit() {
    // Suscribirse a cambios del carrito para actualizar el badge
    this.cartSubscription = this.cartService.getCart$().subscribe(cart => {
      this.cartItemsCount = cart ? cart.totalItems : 0;
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}
