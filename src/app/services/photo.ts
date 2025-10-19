import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';

export interface PhotoOptions {
  source: 'camera' | 'gallery';
  quality?: number;
  allowEditing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(private storage: Storage) { }

  /**
   * Capturar foto desde cámara o galería
   */
  async takePhoto(options: PhotoOptions = { source: 'camera' }): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: options.quality || 70,
        allowEditing: options.allowEditing || true,
        resultType: CameraResultType.DataUrl,
        source: options.source === 'camera' ? CameraSource.Camera : CameraSource.Photos
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Error capturing photo:', error);
      return null;
    }
  }

  /**
   * Subir foto a Firebase Storage
   */
  async uploadPhoto(dataUrl: string, userId: string): Promise<string | null> {
    try {
      // Crear referencia única para la imagen
      const fileName = `profile-photos/${userId}/${Date.now()}.jpg`;
      const imageRef = ref(this.storage, fileName);

      // Subir imagen como data URL
      const uploadResult = await uploadString(imageRef, dataUrl, 'data_url');
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  }

  /**
   * Redimensionar imagen (función auxiliar)
   */
  async resizeImage(dataUrl: string, maxWidth: number = 300, maxHeight: number = 300): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Redimensionar
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a data URL
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(resizedDataUrl);
      };

      img.src = dataUrl;
    });
  }

  /**
   * Obtener avatares predeterminados
   */
  getDefaultAvatars(): string[] {
    return [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=ff6b9d',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=2&backgroundColor=ffbe0b',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=3&backgroundColor=8ecae6',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=4&backgroundColor=ffb3c1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=5&backgroundColor=ffd166'
    ];
  }
}
