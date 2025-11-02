import { Injectable } from '@angular/core';
import { 
  Firestore, 
  doc, 
  getDoc,
  setDoc
} from '@angular/fire/firestore';

export interface IngredientsAllergensData {
  ingredients: string[];
  allergens: string[];
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class IngredientsAllergensService {
  private readonly COLLECTION_NAME = 'ingredients-allergens';
  private readonly DOCUMENT_ID = 'main'; // Un solo documento con todos los datos

  constructor(private firestore: Firestore) {}

  /**
   * Obtener todos los ingredientes y alérgenos
   */
  async getAll(): Promise<{ ingredients: string[], allergens: string[] }> {
    try {
      const docRef = doc(this.firestore, this.COLLECTION_NAME, this.DOCUMENT_ID);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Si no existe, crear con valores por defecto
        const defaultData = {
          ingredients: [
            'Harina', 'Azúcar', 'Huevos', 'Mantequilla', 'Leche', 'Chocolate', 
            'Vainilla', 'Fresas', 'Crema', 'Coco', 'Almendras', 'Nueces', 
            'Canela', 'Miel'
          ].sort(),
          allergens: [
            'Gluten', 'Lácteos', 'Huevos', 'Frutos secos', 'Soja', 'Pescado', 'Mariscos'
          ].sort(),
          updatedAt: new Date()
        };
        await setDoc(docRef, defaultData);
        return { ingredients: defaultData.ingredients, allergens: defaultData.allergens };
      }

      const data = docSnap.data() as IngredientsAllergensData;
      return {
        ingredients: data.ingredients || [],
        allergens: data.allergens || []
      };
    } catch (error) {
      console.error('Error obteniendo ingredientes y alérgenos:', error);
      // Retornar valores por defecto en caso de error
      return {
        ingredients: [
          'Harina', 'Azúcar', 'Huevos', 'Mantequilla', 'Leche', 'Chocolate', 
          'Vainilla', 'Fresas', 'Crema', 'Coco', 'Almendras', 'Nueces', 
          'Canela', 'Miel'
        ].sort(),
        allergens: [
          'Gluten', 'Lácteos', 'Huevos', 'Frutos secos', 'Soja', 'Pescado', 'Mariscos'
        ].sort()
      };
    }
  }

  /**
   * Agregar un nuevo ingrediente
   */
  async addIngredient(ingredient: string): Promise<{ success: boolean, error?: string }> {
    try {
      const data = await this.getAll();
      
      // Verificar si ya existe
      if (data.ingredients.some(i => i.toLowerCase() === ingredient.toLowerCase())) {
        return { success: false, error: 'El ingrediente ya existe' };
      }

      // Agregar y ordenar
      data.ingredients.push(ingredient);
      data.ingredients.sort();

      // Guardar
      await setDoc(doc(this.firestore, this.COLLECTION_NAME, this.DOCUMENT_ID), {
        ...data,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error agregando ingrediente:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Agregar un nuevo alérgeno
   */
  async addAllergen(allergen: string): Promise<{ success: boolean, error?: string }> {
    try {
      const data = await this.getAll();
      
      // Verificar si ya existe
      if (data.allergens.some(a => a.toLowerCase() === allergen.toLowerCase())) {
        return { success: false, error: 'El alérgeno ya existe' };
      }

      // Agregar y ordenar
      data.allergens.push(allergen);
      data.allergens.sort();

      // Guardar
      await setDoc(doc(this.firestore, this.COLLECTION_NAME, this.DOCUMENT_ID), {
        ...data,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error agregando alérgeno:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar un ingrediente (eliminación real, no soft delete)
   */
  async deleteIngredient(ingredient: string): Promise<{ success: boolean, error?: string }> {
    try {
      const data = await this.getAll();
      
      // Filtrar el ingrediente
      data.ingredients = data.ingredients.filter(i => i !== ingredient);

      // Guardar
      await setDoc(doc(this.firestore, this.COLLECTION_NAME, this.DOCUMENT_ID), {
        ...data,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error eliminando ingrediente:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar un alérgeno (eliminación real, no soft delete)
   */
  async deleteAllergen(allergen: string): Promise<{ success: boolean, error?: string }> {
    try {
      const data = await this.getAll();
      
      // Filtrar el alérgeno
      data.allergens = data.allergens.filter(a => a !== allergen);

      // Guardar
      await setDoc(doc(this.firestore, this.COLLECTION_NAME, this.DOCUMENT_ID), {
        ...data,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error eliminando alérgeno:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar toda la lista de ingredientes
   */
  async updateIngredients(ingredients: string[]): Promise<{ success: boolean, error?: string }> {
    try {
      const data = await this.getAll();
      
      await setDoc(doc(this.firestore, this.COLLECTION_NAME, this.DOCUMENT_ID), {
        ingredients: ingredients.sort(),
        allergens: data.allergens,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error actualizando ingredientes:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar toda la lista de alérgenos
   */
  async updateAllergens(allergens: string[]): Promise<{ success: boolean, error?: string }> {
    try {
      const data = await this.getAll();
      
      await setDoc(doc(this.firestore, this.COLLECTION_NAME, this.DOCUMENT_ID), {
        ingredients: data.ingredients,
        allergens: allergens.sort(),
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error actualizando alérgenos:', error);
      return { success: false, error: error.message };
    }
  }
}
