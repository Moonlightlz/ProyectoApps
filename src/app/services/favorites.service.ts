import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, deleteDoc, getDocs, query, where, orderBy, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { ProductService } from './product.service';
import { FavoriteItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoritesSubject = new BehaviorSubject<FavoriteItem[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();
  
  private favoriteProductIds = new Set<string>();
  private unsubscribeFavorites: (() => void) | null = null;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private productService: ProductService
  ) {
    this.initializeFavorites();
  }

  private async initializeFavorites() {
    const user = this.authService.getCurrentUser();
    if (user) {
      await this.loadUserFavorites();
    }
  }

  /**
   * Cargar favoritos del usuario desde Firebase
   */
  async loadUserFavorites(): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        console.log('No hay usuario logueado para cargar favoritos');
        return;
      }

      console.log('🔍 Cargando favoritos del usuario:', user.displayName);
      
      const favoritesRef = collection(this.firestore, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      // Configurar listener en tiempo real
      this.unsubscribeFavorites = onSnapshot(q, async (querySnapshot) => {
        const favorites: FavoriteItem[] = [];
        const productIds = new Set<string>();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const favorite: FavoriteItem = {
            id: doc.id,
            userId: data['userId'],
            productId: data['productId'],
            createdAt: data['createdAt']?.toDate() || new Date()
          };
          favorites.push(favorite);
          productIds.add(data['productId']);
        });

        // Cargar los productos completos para los favoritos
        for (const favorite of favorites) {
          try {
            const products = await this.productService.getAllProducts();
            const product = products.find(p => p.id === favorite.productId);
            if (product) {
              favorite.product = product;
            }
          } catch (error) {
            console.error('Error cargando producto del favorito:', error);
          }
        }

        this.favoriteProductIds = productIds;
        this.favoritesSubject.next(favorites);
        
        console.log(`❤️ Favoritos actualizados: ${favorites.length} productos`);
      });

    } catch (error) {
      console.error('Error cargando favoritos:', error);
    }
  }

  /**
   * Agregar producto a favoritos
   */
  async addToFavorites(product: Product): Promise<boolean> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('Debe iniciar sesión para agregar favoritos');
      }

      // Verificar si ya está en favoritos
      if (this.isFavorite(product.id)) {
        console.log('El producto ya está en favoritos');
        return false;
      }

      console.log('➕ Agregando a favoritos:', product.name);

      const favoritesRef = collection(this.firestore, 'favorites');
      await addDoc(favoritesRef, {
        userId: user.uid,
        productId: product.id,
        createdAt: new Date()
      });

      console.log('✅ Producto agregado a favoritos exitosamente');
      return true;

    } catch (error) {
      console.error('Error agregando a favoritos:', error);
      throw error;
    }
  }

  /**
   * Eliminar producto de favoritos
   */
  async removeFromFavorites(productId: string): Promise<boolean> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('Debe iniciar sesión para eliminar favoritos');
      }

      console.log('➖ Eliminando de favoritos, productId:', productId);

      // Buscar el documento del favorito
      const favoritesRef = collection(this.firestore, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', user.uid),
        where('productId', '==', productId)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('No se encontró el favorito para eliminar');
        return false;
      }

      // Eliminar todos los documentos encontrados (debería ser solo uno)
      for (const docSnapshot of querySnapshot.docs) {
        await deleteDoc(doc(this.firestore, 'favorites', docSnapshot.id));
      }

      console.log('✅ Producto eliminado de favoritos exitosamente');
      return true;

    } catch (error) {
      console.error('Error eliminando de favoritos:', error);
      throw error;
    }
  }

  /**
   * Toggle favorito (agregar o eliminar)
   */
  async toggleFavorite(product: Product): Promise<boolean> {
    try {
      if (this.isFavorite(product.id)) {
        await this.removeFromFavorites(product.id);
        return false; // Ya no es favorito
      } else {
        await this.addToFavorites(product);
        return true; // Ahora es favorito
      }
    } catch (error) {
      console.error('Error haciendo toggle de favorito:', error);
      throw error;
    }
  }

  /**
   * Verificar si un producto es favorito
   */
  isFavorite(productId: string): boolean {
    return this.favoriteProductIds.has(productId);
  }

  /**
   * Obtener todos los favoritos del usuario
   */
  getFavorites(): FavoriteItem[] {
    return this.favoritesSubject.value;
  }

  /**
   * Obtener favoritos como Observable
   */
  getFavorites$(): Observable<FavoriteItem[]> {
    return this.favorites$;
  }

  /**
   * Obtener contador de favoritos
   */
  getFavoritesCount(): number {
    return this.favoritesSubject.value.length;
  }

  /**
   * Limpiar todos los favoritos del usuario
   */
  async clearAllFavorites(): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('Debe iniciar sesión para limpiar favoritos');
      }

      const favoritesRef = collection(this.firestore, 'favorites');
      const q = query(favoritesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      for (const docSnapshot of querySnapshot.docs) {
        await deleteDoc(doc(this.firestore, 'favorites', docSnapshot.id));
      }

      console.log('✅ Todos los favoritos han sido eliminados');

    } catch (error) {
      console.error('Error limpiando favoritos:', error);
      throw error;
    }
  }

  /**
   * Cleanup: desconectar listeners cuando el servicio se destruye
   */
  ngOnDestroy() {
    if (this.unsubscribeFavorites) {
      this.unsubscribeFavorites();
    }
  }
}