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
  async getAllProductsRaw(): Promise<any[]> {
    try {
      const productsRef = collection(this.firestore, 'products');
      const querySnapshot = await getDocs(productsRef);
      
      const rawProducts: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        rawProducts.push({
          id: doc.id,
          ...data
        });
      });
      
      return rawProducts;
    } catch (error) {
      console.error('error obteniendo productos raw:', error);
      return [];
    }
  }

  // inicializar categorias por defecto ejecutar una sola vez
  async initializeDefaultCategories(): Promise<void> {
    try {
      const categoriesRef = collection(this.firestore, 'categories');
      
      // verificar si ya existen categorias para evitar duplicados
      const existingCategoriesSnapshot = await getDocs(categoriesRef);
      if (existingCategoriesSnapshot.size > 0) {
        return;
      }
      
      for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
        const category = DEFAULT_CATEGORIES[i];
        const categoryDoc = doc(categoriesRef);
        const categoryData = {
          ...category,
          id: categoryDoc.id,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(categoryDoc, categoryData);
      }
    } catch (error) {
      console.error('Error inicializando categorías:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo producto
   */
  async createProduct(productData: CreateProductRequest, adminUid: string): Promise<string | null> {
    try {
      console.log('=== SERVICIO: Creando producto ===');
      console.log('Datos recibidos:', productData);
      console.log('Admin UID:', adminUid);
      
      // Obtener la categoría completa (getCategories se encarga de inicializar si es necesario)
      let category = await this.getCategoryById(productData.categoryId);
      if (!category) {
        console.error('Categoría no encontrada:', productData.categoryId);
        const availableCategories = await this.getCategories();
        if (availableCategories.length > 0) {
          category = availableCategories[0];
        } else {
          console.error('No hay categorías disponibles');
          return null;
        }
      }

      console.log('Creando documento de producto...');
      const productsRef = collection(this.firestore, 'products');
      const productDoc = doc(productsRef);
      console.log('ID del documento generado:', productDoc.id);
      
      const product: Omit<Product, 'id'> = {
        name: productData.name,
        description: productData.description,
        shortDescription: productData.shortDescription || '',
        price: productData.price,
        imageUrl: productData.imageUrl || '',
        images: productData.images || [],
        category: category!,
        categoryId: productData.categoryId,
        ingredients: productData.ingredients || [],
        allergens: productData.allergens || [],
        nutritionalInfo: productData.nutritionalInfo || {
          calories: 0,
          fat: 0,
          carbs: 0,
          protein: 0,
          sugar: 0
        },
        variants: productData.variants?.map(v => ({
          ...v,
          id: `${productDoc.id}_${Date.now()}_${Math.random()}`
        })) || [],
        isAvailable: true,
        featured: productData.featured || false,
        preparationTime: productData.preparationTime || 30,
        servingSize: productData.servingSize || '1 porción',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminUid
      };

      console.log('Objeto producto creado:', product);
      console.log('Guardando en Firestore...');
      
      await setDoc(productDoc, {
        ...product,
        id: productDoc.id
      });

      console.log('Producto guardado exitosamente con ID:', productDoc.id);
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
      console.log('Obteniendo TODOS los productos...');
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
          shortDescription: data['shortDescription'],
          price: data['price'],
          imageUrl: data['imageUrl'],
          images: data['images'],
          category: data['category'],
          categoryId: data['categoryId'],
          isAvailable: data['isAvailable'],
          featured: data['featured'],
          preparationTime: data['preparationTime'],
          servingSize: data['servingSize'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
          createdBy: data['createdBy'],
          ingredients: data['ingredients'] || [],
          allergens: data['allergens'] || [],
          nutritionalInfo: data['nutritionalInfo'],
          variants: data['variants'] || [],
          driveFileId: data['driveFileId'],
          driveFileIds: data['driveFileIds'],
          imageSource: data['imageSource']
        } as Product);
      });
      
      console.log(`Total de productos encontrados: ${products.length}`);
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
      console.log('🛒 Obteniendo productos disponibles...');
      console.log('🔧 MODO DEBUG ACTIVADO - Análisis detallado');
      
      // Primero obtener todos los productos sin filtros
      const allProducts = await this.getAllProductsRaw();
      console.log(`📊 Total productos en BD: ${allProducts.length}`);
      
      if (allProducts.length === 0) {
        console.log('⚠️ No hay productos en la base de datos');
        console.log('💡 Sugerencias:');
        console.log('   1. Crear productos desde el panel de admin');
        console.log('   2. Usar los botones de Debug para crear productos de prueba');
        console.log('   3. Verificar que Firebase esté configurado correctamente');
        return [];
      }

      // Analizar cada producto para debug
      console.log('🔍 Analizando disponibilidad de cada producto:');
      allProducts.forEach((product, index) => {
        console.log(`${index + 1}. "${product.name}" - isAvailable: ${product.isAvailable} (tipo: ${typeof product.isAvailable})`);
      });

      // ESTRATEGIA 1: Usar query de Firestore
      console.log('🎯 ESTRATEGIA 1: Query de Firestore con where()');
      let firestoreProducts: Product[] = [];
      try {
        const productsRef = collection(this.firestore, 'products');
        const q = query(
          productsRef, 
          where('isAvailable', '==', true),
          orderBy('createdAt', 'desc')
        );
        
        console.log('🔍 Ejecutando consulta Firestore...');
        const querySnapshot = await getDocs(q);
        console.log(`📋 Documentos encontrados por Firestore: ${querySnapshot.size}`);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`✅ Firestore encontró: "${data['name']}" - isAvailable: ${data['isAvailable']}`);
          firestoreProducts.push({
            id: data['id'],
            name: data['name'],
            description: data['description'],
            shortDescription: data['shortDescription'],
            price: data['price'],
            imageUrl: data['imageUrl'],
            images: data['images'],
            category: data['category'],
            categoryId: data['categoryId'],
            isAvailable: data['isAvailable'],
            featured: data['featured'],
            preparationTime: data['preparationTime'],
            servingSize: data['servingSize'],
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date(),
            createdBy: data['createdBy'],
            ingredients: data['ingredients'] || [],
            allergens: data['allergens'] || [],
            nutritionalInfo: data['nutritionalInfo'],
            variants: data['variants'] || []
          } as Product);
        });
      } catch (firestoreError) {
        console.error('❌ Error en query de Firestore:', firestoreError);
      }

      // ESTRATEGIA 2: Filtrado manual
      console.log('🎯 ESTRATEGIA 2: Filtrado manual en JavaScript');
      const manualProducts = allProducts.filter(product => {
        const isAvailable = product.isAvailable === true;
        console.log(`🔍 Filtro manual: "${product.name}" - isAvailable: ${product.isAvailable} → ${isAvailable ? 'INCLUIDO' : 'EXCLUIDO'}`);
        return isAvailable;
      });
      
      console.log(`📊 Resultados de filtrado manual: ${manualProducts.length} productos`);
      
      // Decidir qué estrategia usar
      let finalProducts: Product[];
      if (firestoreProducts.length > 0) {
        console.log('✅ Usando resultados de Firestore query');
        finalProducts = firestoreProducts;
      } else if (manualProducts.length > 0) {
        console.log('✅ Usando resultados de filtrado manual');
        finalProducts = manualProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } else {
        console.log('⚠️ No se encontraron productos disponibles con ninguna estrategia');
        finalProducts = [];
      }
      
      console.log(`🎉 RESULTADO FINAL: ${finalProducts.length} productos disponibles`);
      finalProducts.forEach((product, index) => {
        console.log(`${index + 1}. "${product.name}" - S/ ${product.price}`);
      });
      
      return finalProducts;
    } catch (error) {
      console.error('❌ Error crítico obteniendo productos disponibles:', error);
      console.log('🔄 Intentando fallback con getAllProducts...');
      
      // Fallback: obtener todos y filtrar
      try {
        const allProducts = await this.getAllProducts();
        const availableProducts = allProducts.filter(p => p.isAvailable === true);
        console.log(`🆘 Fallback exitoso: ${availableProducts.length} productos disponibles`);
        return availableProducts;
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Obtiene solo los productos marcados como destacados y disponibles.
   * Estos productos se mostrarán en la página de inicio.
   * @returns Lista de productos destacados ordenados por fecha de creación
   */
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      console.log('🔍 Ejecutando query de productos destacados...');
      const productsRef = collection(this.firestore, 'products');
      const q = query(
        productsRef,
        where('featured', '==', true),
        where('isAvailable', '==', true),
        orderBy('createdAt', 'desc')
      );
      console.log('📡 Query creada, obteniendo documentos...');
      const querySnapshot = await getDocs(q);
      console.log('📊 Documentos obtenidos:', querySnapshot.size);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: data['id'],
          name: data['name'],
          description: data['description'],
          shortDescription: data['shortDescription'],
          price: data['price'],
          imageUrl: data['imageUrl'],
          images: data['images'],
          category: data['category'],
          categoryId: data['categoryId'],
          isAvailable: data['isAvailable'],
          featured: data['featured'],
          preparationTime: data['preparationTime'],
          servingSize: data['servingSize'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
          createdBy: data['createdBy'],
          ingredients: data['ingredients'] || [],
          allergens: data['allergens'] || [],
          nutritionalInfo: data['nutritionalInfo'],
          variants: data['variants'] || []
        } as Product);
      });
      
      return products;
    } catch (error) {
      console.error('Error obteniendo productos destacados:', error);
      // Fallback: obtener todos y filtrar manualmente
      try {
        const allProducts = await this.getAllProducts();
        return allProducts
          .filter(p => p.featured === true && p.isAvailable === true)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } catch (fallbackError) {
        console.error('Error en fallback de productos destacados:', fallbackError);
        return [];
      }
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
          shortDescription: data['shortDescription'],
          price: data['price'],
          imageUrl: data['imageUrl'],
          images: data['images'],
          category: data['category'],
          categoryId: data['categoryId'],
          isAvailable: data['isAvailable'],
          featured: data['featured'],
          preparationTime: data['preparationTime'],
          servingSize: data['servingSize'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
          createdBy: data['createdBy'],
          ingredients: data['ingredients'] || [],
          allergens: data['allergens'] || [],
          nutritionalInfo: data['nutritionalInfo'],
          variants: data['variants'] || [],
          driveFileId: data['driveFileId'],
          driveFileIds: data['driveFileIds'],
          imageSource: data['imageSource']
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
          shortDescription: data['shortDescription'],
          price: data['price'],
          imageUrl: data['imageUrl'],
          images: data['images'],
          category: data['category'],
          categoryId: data['categoryId'],
          isAvailable: data['isAvailable'],
          featured: data['featured'],
          preparationTime: data['preparationTime'],
          servingSize: data['servingSize'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
          createdBy: data['createdBy'],
          ingredients: data['ingredients'] || [],
          allergens: data['allergens'] || [],
          nutritionalInfo: data['nutritionalInfo'],
          variants: data['variants'] || [],
          driveFileId: data['driveFileId'],
          driveFileIds: data['driveFileIds'],
          imageSource: data['imageSource']
        } as Product;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo producto por ID:', error);
      return null;
    }
  }

  /**
   * Actualiza un producto existente.
   * Filtra campos undefined para evitar errores de Firestore.
   * @param productId - ID del producto a actualizar
   * @param updates - Campos a actualizar
   * @returns true si se actualizó correctamente
   */
  async updateProduct(productId: string, updates: UpdateProductRequest): Promise<boolean> {
    try {
      const productRef = doc(this.firestore, 'products', productId);
      
      // Filtrar campos undefined para evitar error de Firestore
      const cleanUpdates: any = {};
      Object.keys(updates).forEach(key => {
        const value = (updates as any)[key];
        if (value !== undefined) {
          cleanUpdates[key] = value;
        }
      });
      
      // Log para verificar el valor de featured
      if ('featured' in updates) {
        console.log('⭐ Actualizando featured:', updates.featured, '→', cleanUpdates.featured);
      }
      
      // Agregar timestamp de actualización
      cleanUpdates.updatedAt = new Date();
      
      console.log('💾 Actualizando producto:', productId, 'con datos:', cleanUpdates);
      await updateDoc(productRef, cleanUpdates);
      console.log('✅ Producto actualizado correctamente');
      
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
      console.log('Obteniendo categorías de Firestore...');
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
      
      console.log(`Encontradas ${categories.length} categorías en Firestore`);
      
      // Si no hay categorías en Firestore, inicializarlas una sola vez
      if (categories.length === 0) {
        await this.initializeDefaultCategories();
        // Volver a obtener las categorías después de inicializarlas
        const retrySnapshot = await getDocs(q);
        const retryCategories: ProductCategory[] = [];
        retrySnapshot.forEach((doc) => {
          const data = doc.data();
          retryCategories.push({
            id: data['id'],
            name: data['name'],
            description: data['description'],
            icon: data['icon'],
            order: data['order'],
            isActive: data['isActive']
          } as ProductCategory);
        });
        return retryCategories;
      }
      
      return categories;
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      // En caso de error, devolver las categorías por defecto
      console.log('Devolviendo categorías por defecto debido a error');
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
      console.log('Obteniendo categorías activas...');
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
      
      console.log(`Categorías activas encontradas: ${categories.length}`);
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

  /**
   * Función para limpiar categorías duplicadas (usar solo una vez)
   */
  async cleanDuplicateCategories(): Promise<void> {
    try {
      const categoriesRef = collection(this.firestore, 'categories');
      const querySnapshot = await getDocs(categoriesRef);
      
      const categoryNames = new Map<string, string[]>(); // nombre -> [ids]
      
      // Agrupar categorías por nombre
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const name = data['name'];
        if (!categoryNames.has(name)) {
          categoryNames.set(name, []);
        }
        categoryNames.get(name)!.push(doc.id);
      });
      
      // Eliminar duplicados (mantener solo el primero de cada nombre)
      for (const [name, ids] of categoryNames.entries()) {
        if (ids.length > 1) {
          console.log(`Encontrados ${ids.length} duplicados para "${name}". Eliminando ${ids.length - 1} duplicados.`);
          // Mantener el primer ID, eliminar el resto
          for (let i = 1; i < ids.length; i++) {
            const docRef = doc(this.firestore, 'categories', ids[i]);
            await deleteDoc(docRef);
            console.log(`Eliminada categoría duplicada: ${ids[i]}`);
          }
        }
      }
      
      console.log('Limpieza de categorías duplicadas completada');
    } catch (error) {
      console.error('Error limpiando categorías duplicadas:', error);
    }
  }
}