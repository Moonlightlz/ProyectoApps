import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  
  constructor(private firestore: Firestore) {}

  /**
   * Crear un nuevo documento
   */
  async create(collectionName: string, data: any) {
    try {
      const collectionRef = collection(this.firestore, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Leer todos los documentos de una colección
   */
  async readAll(collectionName: string) {
    try {
      const collectionRef = collection(this.firestore, collectionName);
      const snapshot = await getDocs(collectionRef);
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: documents };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Leer un documento específico por ID
   */
  async readOne(collectionName: string, id: string) {
    try {
      const docRef = doc(this.firestore, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          success: true, 
          data: { id: docSnap.id, ...docSnap.data() } 
        };
      } else {
        return { success: false, error: 'Documento no encontrado' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar un documento
   */
  async update(collectionName: string, id: string, data: any) {
    try {
      const docRef = doc(this.firestore, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar un documento
   */
  async delete(collectionName: string, id: string) {
    try {
      const docRef = doc(this.firestore, collectionName, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Consulta con filtros
   */
  async queryDocuments(
    collectionName: string, 
    field: string, 
    operator: any, 
    value: any,
    orderByField?: string,
    limitCount?: number
  ) {
    try {
      const collectionRef = collection(this.firestore, collectionName);
      let q = query(collectionRef, where(field, operator, value));
      
      if (orderByField) {
        q = query(q, orderBy(orderByField));
      }
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: documents };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}