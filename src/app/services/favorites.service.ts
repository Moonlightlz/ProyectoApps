import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
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
    private userService: UserService,
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
   * Cargar favoritos del usuario desde el documento del usuario
   */
  async loadUserFavorites(): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        console.log('No hay usuario logueado para cargar favoritos');
        this.favoriteProductIds.clear();
        this.favoritesSubject.next([]);
        return;
      }

      console.log('🔍 Cargando favoritos del usuario:', user.displayName);
      
      // Configurar listener en tiempo real al documento del usuario
      const userDocRef = doc(this.firestore, 'users', user.uid);
      
      this.unsubscribeFavorites = onSnapshot(userDocRef, async (docSnapshot) => {
        if (!docSnapshot.exists()) {
          console.log('Documento de usuario no existe');
          this.favoriteProductIds.clear();
          this.favoritesSubject.next([]);
          return;
        }

        const userData = docSnapshot.data();
        const favoriteProductIds: string[] = userData['profile']?.['favoriteProducts'] || [];
        
        console.log(`❤️ Favoritos encontrados: ${favoriteProductIds.length}`);

        // Actualizar el Set de IDs
        this.favoriteProductIds = new Set(favoriteProductIds);

        // Cargar los productos completos
        const favorites: FavoriteItem[] = [];
        const products = await this.productService.getAllProducts();

        for (const productId of favoriteProductIds) {
          const product = products.find(p => p.id === productId);
          if (product) {
            favorites.push({
              id: productId,
              userId: user.uid,
              productId: productId,
              createdAt: new Date(),
              product: product
            });
          }
        }

        this.favoritesSubject.next(favorites);
        console.log(`✅ Favoritos cargados: ${favorites.length} productos con datos completos`);
      });

    } catch (error) {
      console.error('Error cargando favoritos:', error);
      this.favoriteProductIds.clear();
      this.favoritesSubject.next([]);
    }
  }

  /**
   * Agregar producto a favoritos en el documento del usuario
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

      // Obtener favoritos actuales directamente de Firestore (datos frescos)
      const userDocRef = doc(this.firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        console.error('Documento de usuario no existe');
        throw new Error('Usuario no encontrado');
      }

      const userData = userDocSnap.data();
      const currentFavorites = userData['profile']?.['favoriteProducts'] || [];
      
      console.log('📋 Favoritos actuales antes de agregar:', currentFavorites);

      // Verificar duplicado por si acaso
      if (currentFavorites.includes(product.id)) {
        console.log('⚠️ El producto ya está en favoritos (verificación doble)');
        return false;
      }

      // Agregar el nuevo producto al array
      const updatedFavorites = [...currentFavorites, product.id];
      
      console.log('📋 Favoritos actualizados después de agregar:', updatedFavorites);

      // Actualizar el documento del usuario
      await updateDoc(userDocRef, {
        'profile.favoriteProducts': updatedFavorites
      });

      console.log('✅ Producto agregado a favoritos exitosamente');
      return true;

    } catch (error) {
      console.error('Error agregando a favoritos:', error);
      throw error;
    }
  }

  /**
   * Eliminar producto de favoritos del documento del usuario
   */
  async removeFromFavorites(productId: string): Promise<boolean> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('Debe iniciar sesión para eliminar favoritos');
      }

      console.log('➖ Eliminando de favoritos, productId:', productId);

      // Obtener favoritos actuales directamente de Firestore (datos frescos)
      const userDocRef = doc(this.firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        console.error('Documento de usuario no existe');
        throw new Error('Usuario no encontrado');
      }

      const userData = userDocSnap.data();
      const currentFavorites = userData['profile']?.['favoriteProducts'] || [];
      
      console.log('📋 Favoritos actuales antes de eliminar:', currentFavorites);

      // Verificar si el producto está en favoritos
      if (!currentFavorites.includes(productId)) {
        console.log('El producto no está en favoritos');
        return false;
      }

      // Filtrar el producto a eliminar
      const updatedFavorites = currentFavorites.filter((id: string) => id !== productId);
      
      console.log('📋 Favoritos actualizados después de eliminar:', updatedFavorites);

      // Actualizar el documento del usuario
      await updateDoc(userDocRef, {
        'profile.favoriteProducts': updatedFavorites
      });

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

      // Actualizar el documento del usuario con array vacío
      const userDocRef = doc(this.firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        'profile.favoriteProducts': []
      });

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