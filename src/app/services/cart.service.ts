import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { ProductService } from './product.service';
import { CartItem, Cart } from '../models/cart.model';
import { Product } from '../models/product.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();
  
  private unsubscribeCart: (() => void) | null = null;
  private readonly CART_STORAGE_KEY = 'bakery_cart';

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private productService: ProductService
  ) {
    this.initializeCart();
  }

  private async initializeCart() {
    const user = this.authService.getCurrentUser();
    if (user) {
      await this.loadUserCart();
    } else {
      // Cargar carrito desde localStorage si no hay usuario logueado
      this.loadCartFromStorage();
    }
  }

  /**
   * Cargar carrito del usuario desde su documento en Firestore
   */
  async loadUserCart(): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        console.log('No hay usuario logueado para cargar carrito');
        return;
      }

      console.log('🛒 Cargando carrito del usuario:', user.displayName);
      
      // Leer directamente del documento del usuario
      const userRef = doc(this.firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const cartData = userData['profile']?.['cart'];
        
        if (cartData && cartData.items && cartData.items.length > 0) {
          // Construir el carrito con los datos del usuario
          const cart: Cart = {
            id: user.uid, // Usamos el UID como ID del carrito
            userId: user.uid,
            items: [],
            totalItems: cartData.totalItems || 0,
            subtotal: cartData.subtotal || 0,
            total: cartData.subtotal || 0,
            createdAt: new Date(),
            updatedAt: cartData.updatedAt?.toDate() || new Date(),
            status: 'active'
          };

          // Cargar productos completos para cada item
          const products = await this.productService.getAllProducts();
          
          for (const item of cartData.items) {
            const product = products.find(p => p.id === item.productId);
            
            if (product) {
              const cartItem: CartItem = {
                id: item.productId, // Usar productId como ID único del item
                productId: item.productId,
                product: product,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
                addedAt: item.addedAt?.toDate() || new Date(),
                notes: item.notes
              };
              cart.items.push(cartItem);
            }
          }

          this.cartSubject.next(cart);
          console.log(`🛒 Carrito cargado: ${cart.items.length} items, total: S/ ${cart.total}`);
        } else {
          // No hay carrito, crear uno vacío
          this.createEmptyCart();
        }
      } else {
        this.createEmptyCart();
      }

    } catch (error) {
      console.error('Error cargando carrito:', error);
      this.createEmptyCart();
    }
  }

  /**
   * Crear un carrito vacío
   */
  private createEmptyCart(): void {
    const user = this.authService.getCurrentUser();
    const userId = user ? user.uid : 'guest';

    const cart: Cart = {
      id: userId,
      userId: userId,
      items: [],
      totalItems: 0,
      subtotal: 0,
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    this.cartSubject.next(cart);
  }

  /**
   * Agregar producto al carrito
   */
  async addToCart(product: Product, quantity: number = 1, notes?: string): Promise<boolean> {
    try {
      console.log(`🛒 Agregando al carrito: ${product.name} (cantidad: ${quantity})`);

      let cart = this.cartSubject.value;
      
      if (!cart) {
        this.createEmptyCart();
        cart = this.cartSubject.value;
      }

      if (!cart) return false;

      // Verificar si el producto ya está en el carrito
      const existingItemIndex = cart.items.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        // Actualizar cantidad del item existente
        const existingItem = cart.items[existingItemIndex];
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
        existingItem.addedAt = new Date();
        
        if (notes) {
          existingItem.notes = notes;
        }

        console.log(`📦 Producto actualizado en carrito: ${product.name} (nueva cantidad: ${existingItem.quantity})`);
      } else {
        // Agregar nuevo item al carrito
        const cartItem: CartItem = {
          id: product.id, // Usar el ID del producto como ID del item
          productId: product.id,
          product: product,
          quantity: quantity,
          unitPrice: product.price,
          totalPrice: quantity * product.price,
          addedAt: new Date(),
          notes: notes
        };

        cart.items.push(cartItem);
        console.log(`✅ Nuevo producto agregado al carrito: ${product.name}`);
      }

      // Recalcular totales
      this.recalculateCartTotals(cart);

      // Guardar cambios
      await this.saveCartToUser(cart);

      console.log(`🛒 Carrito actualizado: ${cart.totalItems} items, total: S/ ${cart.total}`);
      return true;

    } catch (error) {
      console.error('Error agregando al carrito:', error);
      throw error;
    }
  }

  /**
   * Actualizar cantidad de un item en el carrito
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<boolean> {
    try {
      const cart = this.cartSubject.value;
      if (!cart) return false;

      const itemIndex = cart.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return false;

      if (quantity <= 0) {
        // Eliminar item si la cantidad es 0 o negativa
        return await this.removeFromCart(itemId);
      }

      const item = cart.items[itemIndex];
      item.quantity = quantity;
      item.totalPrice = quantity * item.unitPrice;

      this.recalculateCartTotals(cart);
      await this.saveCartToUser(cart);

      console.log(`📦 Cantidad actualizada: ${item.product.name} -> ${quantity}`);
      return true;

    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      return false;
    }
  }

  /**
   * Eliminar producto del carrito
   */
  async removeFromCart(itemId: string): Promise<boolean> {
    try {
      const cart = this.cartSubject.value;
      if (!cart) return false;

      const itemIndex = cart.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return false;

      const removedItem = cart.items[itemIndex];
      cart.items.splice(itemIndex, 1);

      this.recalculateCartTotals(cart);
      await this.saveCartToUser(cart);

      console.log(`🗑️ Producto eliminado del carrito: ${removedItem.product.name}`);
      return true;

    } catch (error) {
      console.error('Error eliminando del carrito:', error);
      return false;
    }
  }

  /**
   * Limpiar todo el carrito
   */
  async clearCart(): Promise<void> {
    try {
      const cart = this.cartSubject.value;
      if (!cart) return;

      cart.items = [];
      this.recalculateCartTotals(cart);
      await this.saveCartToUser(cart);

      console.log('🧹 Carrito limpiado completamente');

    } catch (error) {
      console.error('Error limpiando carrito:', error);
      throw error;
    }
  }

  /**
   * Recalcular totales del carrito
   */
  private recalculateCartTotals(cart: Cart): void {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Aplicar descuentos si existen
    let total = cart.subtotal;
    if (cart.discount && cart.discount > 0) {
      total -= cart.discount;
    }
    
    // Aplicar impuestos si existen
    if (cart.tax && cart.tax > 0) {
      total += cart.tax;
    }
    
    cart.total = Math.max(0, total); // Asegurar que el total no sea negativo
    cart.updatedAt = new Date();
  }

  /**
   * Guardar carrito en el documento del usuario en Firestore
   */
  private async saveCartToUser(cart: Cart): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      
      if (user) {
        console.log('💾 Guardando carrito en documento del usuario...');
        
        // Preparar items para guardar (sin el objeto product completo)
        const cartItems = cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes,
          addedAt: item.addedAt
        }));

        // Actualizar el documento del usuario
        const userRef = doc(this.firestore, `users/${user.uid}`);
        await updateDoc(userRef, {
          'profile.cart': {
            items: cartItems,
            totalItems: cart.totalItems,
            subtotal: cart.subtotal,
            updatedAt: new Date()
          }
        });

        console.log(`✅ Carrito guardado: ${cart.items.length} items`);
      } else {
        // Guardar en localStorage para invitados
        this.saveCartToStorage(cart);
      }

      // Actualizar el subject
      this.cartSubject.next(cart);

    } catch (error) {
      console.error('Error guardando carrito:', error);
      // Fallback a localStorage
      this.saveCartToStorage(cart);
      this.cartSubject.next(cart);
    }
  }

  /**
   * Guardar carrito en localStorage
   */
  private saveCartToStorage(cart: Cart): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error guardando carrito en localStorage:', error);
    }
  }

  /**
   * Cargar carrito desde localStorage
   */
  private loadCartFromStorage(): void {
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
      if (cartData) {
        const cart: Cart = JSON.parse(cartData);
        // Convertir fechas desde strings
        cart.createdAt = new Date(cart.createdAt);
        cart.updatedAt = new Date(cart.updatedAt);
        cart.items.forEach(item => {
          item.addedAt = new Date(item.addedAt);
        });
        
        this.cartSubject.next(cart);
        console.log('🛒 Carrito cargado desde localStorage');
      }
    } catch (error) {
      console.error('Error cargando carrito desde localStorage:', error);
    }
  }

  /**
   * Obtener carrito actual
   */
  getCurrentCart(): Cart | null {
    return this.cartSubject.value;
  }

  /**
   * Obtener carrito como Observable
   */
  getCart$(): Observable<Cart | null> {
    return this.cart$;
  }

  /**
   * Obtener número total de items en el carrito
   */
  getItemCount(): number {
    const cart = this.cartSubject.value;
    return cart ? cart.totalItems : 0;
  }

  /**
   * Obtener total del carrito
   */
  getCartTotal(): number {
    const cart = this.cartSubject.value;
    return cart ? cart.total : 0;
  }

  /**
   * Verificar si un producto está en el carrito
   */
  isInCart(productId: string): boolean {
    const cart = this.cartSubject.value;
    return cart ? cart.items.some(item => item.productId === productId) : false;
  }

  /**
   * Obtener cantidad de un producto específico en el carrito
   */
  getProductQuantityInCart(productId: string): number {
    const cart = this.cartSubject.value;
    if (!cart) return 0;
    
    const item = cart.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Cleanup
   */
  ngOnDestroy() {
    if (this.unsubscribeCart) {
      this.unsubscribeCart();
    }
  }
}