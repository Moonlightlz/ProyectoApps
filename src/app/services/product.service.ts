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
  ) { 
    console.log('🔥 ProductService inicializado');
    console.log('🔥 Firestore instance:', this.firestore);
    this.testFirestoreConnection();
  }

  /**
   * Probar conexión directa con Firestore
   */
  async testFirestoreConnection(): Promise<void> {
    try {
      console.log('🧪 PROBANDO CONEXIÓN CON FIRESTORE...');
      
      // Intentar obtener información básica de Firestore
      const testRef = collection(this.firestore, 'products');
      console.log('✅ Referencia de colección creada:', testRef);
      
      // Intentar hacer una consulta simple
      const snapshot = await getDocs(testRef);
      console.log(`✅ Consulta exitosa. Documentos encontrados: ${snapshot.size}`);
      
      if (snapshot.size > 0) {
        console.log('📋 Primeros documentos en la colección:');
        snapshot.docs.slice(0, 3).forEach((doc, index) => {
          console.log(`   ${index + 1}. ID: ${doc.id}`, doc.data());
        });
      } else {
        console.log('⚠️ La colección "products" está vacía');
      }
      
    } catch (error) {
      console.error('❌ ERROR EN CONEXIÓN CON FIRESTORE:', error);
      console.error('   Posibles causas:');
      console.error('   1. Configuración de Firebase incorrecta');
      console.error('   2. Reglas de seguridad muy restrictivas');
      console.error('   3. Problemas de red');
      console.error('   4. Proyecto de Firebase no configurado');
    }
  }

  /**
   * Probar reglas de seguridad de Firestore
   */
  async testFirestoreRules(): Promise<void> {
    try {
      console.log('🔒 PROBANDO REGLAS DE SEGURIDAD DE FIRESTORE...');
      
      // Probar lectura de productos
      console.log('📖 Probando lectura de productos...');
      const productsRef = collection(this.firestore, 'products');
      const readTest = await getDocs(productsRef);
      console.log(`✅ Lectura exitosa: ${readTest.size} documentos`);
      
      // Probar lectura de categorías
      console.log('📖 Probando lectura de categorías...');
      const categoriesRef = collection(this.firestore, 'categories');
      const categoriesTest = await getDocs(categoriesRef);
      console.log(`✅ Lectura de categorías exitosa: ${categoriesTest.size} documentos`);
      
      // Probar escritura (crear un documento de prueba)
      console.log('✍️ Probando escritura...');
      const testDoc = doc(collection(this.firestore, 'test'));
      await setDoc(testDoc, {
        test: true,
        timestamp: new Date(),
        message: 'Test de escritura'
      });
      console.log('✅ Escritura exitosa');
      
      // Limpiar documento de prueba
      await deleteDoc(testDoc);
      console.log('🧹 Documento de prueba eliminado');
      
    } catch (error) {
      console.error('❌ ERROR EN REGLAS DE SEGURIDAD:', error);
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          console.error('🚫 PROBLEMA: Permisos denegados');
          console.error('💡 SOLUCIÓN: Revisar reglas de seguridad en Firebase Console');
          console.error('🔗 Firebase Console: https://console.firebase.google.com');
        } else if (error.message.includes('unauthenticated')) {
          console.error('🚫 PROBLEMA: Usuario no autenticado');
          console.error('💡 SOLUCIÓN: Iniciar sesión primero');
        }
      }
    }
  }
  async getAllProductsRaw(): Promise<any[]> {
    try {
      console.log('🔍 OBTENIENDO TODOS LOS PRODUCTOS RAW (sin filtros)...');
      const productsRef = collection(this.firestore, 'products');
      const querySnapshot = await getDocs(productsRef);
      
      console.log(`📊 Total de documentos en Firestore: ${querySnapshot.size}`);
      
      const rawProducts: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        rawProducts.push({
          id: doc.id,
          ...data
        });
        console.log(`📄 Documento encontrado:`, {
          id: doc.id,
          name: data['name'],
          isAvailable: data['isAvailable'],
          createdAt: data['createdAt'],
          createdBy: data['createdBy']
        });
      });
      
      return rawProducts;
    } catch (error) {
      console.error('❌ Error obteniendo productos raw:', error);
      return [];
    }
  }

  /**
   * Inicializar categorías por defecto (ejecutar una sola vez)
   */
  async initializeDefaultCategories(): Promise<void> {
    try {
      console.log('Iniciando inicialización de categorías...');
      const categoriesRef = collection(this.firestore, 'categories');
      
      for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
        const category = DEFAULT_CATEGORIES[i];
        const categoryDoc = doc(categoriesRef);
        const categoryData = {
          ...category,
          id: categoryDoc.id,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log(`Guardando categoría ${i + 1}:`, categoryData);
        await setDoc(categoryDoc, categoryData);
      }
      
      console.log('Categorías por defecto inicializadas exitosamente');
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
      
      // Verificar si las categorías están inicializadas, si no, inicializarlas
      const categories = await this.getCategories();
      console.log('Categorías disponibles:', categories);
      if (categories.length === 0) {
        console.log('Inicializando categorías por defecto...');
        await this.initializeDefaultCategories();
      }

      // Obtener la categoría completa
      let category = await this.getCategoryById(productData.categoryId);
      console.log('Categoría encontrada:', category);
      if (!category) {
        console.error('Categoría no encontrada:', productData.categoryId);
        console.log('Intentando usar la primera categoría disponible...');
        const availableCategories = await this.getCategories();
        if (availableCategories.length > 0) {
          category = availableCategories[0];
          console.log('Usando categoría:', category.name);
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
}