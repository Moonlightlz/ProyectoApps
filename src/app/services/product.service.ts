import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  addDoc 
} from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Product, CreateProductRequest, UpdateProductRequest, ProductCategory, DEFAULT_CATEGORIES } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private firestore: Firestore,
    private storage: Storage
  ) { }

  /**
   * Inicializar categorías por defecto (ejecutar una sola vez)
   */
  async initializeDefaultCategories(): Promise<void> {
    try {
      const categoriesRef = collection(this.firestore, 'categories');
      
      for (const category of DEFAULT_CATEGORIES) {
        const categoryDoc = doc(categoriesRef);
        await setDoc(categoryDoc, {
          ...category,
          id: categoryDoc.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      console.log('Categorías por defecto inicializadas');
    } catch (error) {
      console.error('Error inicializando categorías:', error);
    }
  }

  /**
   * Crear nuevo producto
   */
  async createProduct(productData: CreateProductRequest, adminUid: string): Promise<string | null> {
    try {
      // Obtener la categoría completa
      const category = await this.getCategoryById(productData.categoryId);
      if (!category) {
        console.error('Categoría no encontrada:', productData.categoryId);
        return null;
      }

      const productsRef = collection(this.firestore, 'products');
      const productDoc = doc(productsRef);
      
      const product: Omit<Product, 'id'> = {
        name: productData.name,
        description: productData.description,
        shortDescription: productData.shortDescription,
        price: productData.price,
        imageUrl: productData.imageUrl || '',
        images: productData.images,
        category: category,
        categoryId: productData.categoryId,
        ingredients: productData.ingredients,
        allergens: productData.allergens,
        nutritionalInfo: productData.nutritionalInfo,
        variants: productData.variants?.map(v => ({
          ...v,
          id: `${productDoc.id}_${Date.now()}_${Math.random()}`
        })) || [],
        isAvailable: true,
        featured: productData.featured,
        preparationTime: productData.preparationTime,
        servingSize: productData.servingSize,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminUid
      };

      await setDoc(productDoc, {
        ...product,
        id: productDoc.id
      });

      return productDoc.id;
    } catch (error) {
      console.error('Error creando producto:', error);
      return null;
    }
  }

  /**
   * Obtener todos los productos
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(this.firestore, 'products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: data['id'],
          name: data['name'],
          description: data['description'],
          price: data['price'],
          imageUrl: data['imageUrl'],
          category: data['category'],
          isAvailable: data['isAvailable'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
          createdBy: data['createdBy'],
          ingredients: data['ingredients'],
          allergens: data['allergens'],
          nutritionalInfo: data['nutritionalInfo'],
          variants: data['variants']
        } as Product);
      });
      
      return products;
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      return [];
    }
  }

  /**
   * Obtener productos disponibles (para usuarios)
   */
  async getAvailableProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(this.firestore, 'products');
      const q = query(
        productsRef, 
        where('isAvailable', '==', true),
        orderBy('category.order', 'asc'),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: data['id'],
          name: data['name'],
          description: data['description'],
          price: data['price'],
          imageUrl: data['imageUrl'],
          category: data['category'],
          isAvailable: data['isAvailable'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
          createdBy: data['createdBy'],
          ingredients: data['ingredients'],
          allergens: data['allergens'],
          nutritionalInfo: data['nutritionalInfo'],
          variants: data['variants']
        } as Product);
      });
      
      return products;
    } catch (error) {
      console.error('Error obteniendo productos disponibles:', error);
      return [];
    }
  }

  /**
   * Obtener productos por categoría
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      const productsRef = collection(this.firestore, 'products');
      const q = query(
        productsRef, 
        where('category.id', '==', categoryId),
        where('isAvailable', '==', true),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: data['id'],
          name: data['name'],
          description: data['description'],
          price: data['price'],
          imageUrl: data['imageUrl'],
          category: data['category'],
          isAvailable: data['isAvailable'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
          createdBy: data['createdBy'],
          ingredients: data['ingredients'],
          allergens: data['allergens'],
          nutritionalInfo: data['nutritionalInfo'],
          variants: data['variants']
        } as Product);
      });
      
      return products;
    } catch (error) {
      console.error('Error obteniendo productos por categoría:', error);
      return [];
    }
  }

  /**
   * Obtener producto por ID
   */
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const productRef = doc(this.firestore, 'products', productId);
      const productDoc = await getDoc(productRef);
      
      if (productDoc.exists()) {
        const data = productDoc.data();
        return {
          id: data['id'],
          name: data['name'],
          description: data['description'],
          price: data['price'],
          imageUrl: data['imageUrl'],
          category: data['category'],
          isAvailable: data['isAvailable'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
          createdBy: data['createdBy'],
          ingredients: data['ingredients'],
          allergens: data['allergens'],
          nutritionalInfo: data['nutritionalInfo'],
          variants: data['variants']
        } as Product;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo producto por ID:', error);
      return null;
    }
  }

  /**
   * Actualizar producto
   */
  async updateProduct(productId: string, updates: UpdateProductRequest): Promise<boolean> {
    try {
      const productRef = doc(this.firestore, 'products', productId);
      
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error actualizando producto:', error);
      return false;
    }
  }

  /**
   * Eliminar producto
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const productRef = doc(this.firestore, 'products', productId);
      
      // Obtener el producto para eliminar la imagen
      const product = await this.getProductById(productId);
      if (product?.imageUrl) {
        await this.deleteProductImage(product.imageUrl);
      }
      
      await deleteDoc(productRef);
      return true;
    } catch (error) {
      console.error('Error eliminando producto:', error);
      return false;
    }
  }

  /**
   * Subir imagen de producto
   */
  async uploadProductImage(dataUrl: string, productId: string): Promise<string | null> {
    try {
      const fileName = `products/${productId}/${Date.now()}.jpg`;
      const imageRef = ref(this.storage, fileName);

      const uploadResult = await uploadString(imageRef, dataUrl, 'data_url');
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error subiendo imagen de producto:', error);
      return null;
    }
  }

  /**
   * Eliminar imagen de producto
   */
  async deleteProductImage(imageUrl: string): Promise<boolean> {
    try {
      const imageRef = ref(this.storage, imageUrl);
      await deleteObject(imageRef);
      return true;
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      return false;
    }
  }

  /**
   * Obtener todas las categorías
   */
  async getCategories(): Promise<ProductCategory[]> {
    try {
      const categoriesRef = collection(this.firestore, 'categories');
      const q = query(categoriesRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const categories: ProductCategory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: data['id'],
          name: data['name'],
          description: data['description'],
          icon: data['icon'],
          order: data['order'],
          isActive: data['isActive']
        } as ProductCategory);
      });
      
      // Si no hay categorías en Firestore, devolver las categorías por defecto
      if (categories.length === 0) {
        console.log('No hay categorías en Firestore, usando categorías por defecto');
        return DEFAULT_CATEGORIES.map((cat, index) => ({
          ...cat,
          id: `default-${index + 1}`
        }));
      }
      
      return categories;
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      // En caso de error, devolver las categorías por defecto
      return DEFAULT_CATEGORIES.map((cat, index) => ({
        ...cat,
        id: `default-${index + 1}`
      }));
    }
  }

  /**
   * Obtener categorías activas
   */
  async getActiveCategories(): Promise<ProductCategory[]> {
    try {
      const categoriesRef = collection(this.firestore, 'categories');
      const q = query(
        categoriesRef, 
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const categories: ProductCategory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: data['id'],
          name: data['name'],
          description: data['description'],
          icon: data['icon'],
          order: data['order'],
          isActive: data['isActive']
        } as ProductCategory);
      });
      
      return categories;
    } catch (error) {
      console.error('Error obteniendo categorías activas:', error);
      return [];
    }
  }

  /**
   * Obtener categoría por ID
   */
  async getCategoryById(categoryId: string): Promise<ProductCategory | null> {
    try {
      const categoryRef = doc(this.firestore, 'categories', categoryId);
      const categoryDoc = await getDoc(categoryRef);
      
      if (categoryDoc.exists()) {
        const data = categoryDoc.data();
        return {
          id: data['id'],
          name: data['name'],
          description: data['description'],
          icon: data['icon'],
          order: data['order'],
          isActive: data['isActive']
        } as ProductCategory;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo categoría por ID:', error);
      return null;
    }
  }
}