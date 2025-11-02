/**
 * Servicio de integración con Google Drive API v3.
 * 
 * Proporciona funcionalidades para:
 * - Autenticación OAuth 2.0 con Google Identity Services
 * - Subida de imágenes con conversión automática a WebP
 * - Selección de archivos mediante Google Picker
 * - Gestión de permisos públicos en archivos
 * - Generación de URLs públicas para visualización de imágenes
 * 
 * Configuración requerida:
 * - Las credenciales (CLIENT_ID y API_KEY) deben configurarse en Google Cloud Console
 * - Los URIs de redirección deben incluir los dominios de desarrollo y producción
 * - Ver guía completa en: guias/GoogleDriveSetup.md
 * 
 * @author Equipo de desarrollo ProyectoApps
 */
import { Injectable } from '@angular/core';

declare const gapi: any;
declare const google: any;

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

export interface StorageInfo {
  limit: number;
  usage: number;
  available: number;
  limitGB: string;
  usageGB: string;
  availableGB: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  // Credenciales configuradas en Google Cloud Console
  // Para actualizar estas credenciales, consultar: guias/GoogleDriveSetup.md
  private CLIENT_ID = '134621478329-6cj15n0fevmmv6c2pisrnjtvqr5a8st2.apps.googleusercontent.com';
  private API_KEY = 'AIzaSyDo7sejiP9Wdz99lbc0zeZfFwg6Yu7fSw0';
  
  private SCOPES = 'https://www.googleapis.com/auth/drive.file';
  
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private isGapiLoaded = false;
  private productsFolderId: string | null = null;
  
  // URL base de la API de Drive (se usa fetch directo en lugar de Discovery Documents)
  private readonly DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';

  constructor() {
    this.loadStoredToken();
  }

  /**
   * Carga el token de autenticación almacenado en localStorage.
   * Restaura la sesión del usuario si el token aún no ha expirado.
   * También recupera el ID de la carpeta de productos si existe.
   */
  private loadStoredToken() {
    const savedToken = localStorage.getItem('drive_access_token');
    const expiry = parseInt(localStorage.getItem('drive_token_expiry') || '0');
    
    if (savedToken && Date.now() < expiry) {
      this.accessToken = savedToken;
      this.tokenExpiry = expiry;
    }
    
    this.productsFolderId = localStorage.getItem('products_folder_id');
  }

  /**
   * Carga las librerías necesarias de Google para OAuth y Drive API.
   * Utiliza Google Identity Services para autenticación y gapi para Drive API y Picker.
   */
  private async loadGoogleApi(): Promise<void> {
    if (this.isGapiLoaded) {
      return;
    }

    return new Promise((resolve, reject) => {
      // Cargar Google Identity Services (GSI) para OAuth 2.0
      const gsiScript = document.createElement('script');
      gsiScript.src = 'https://accounts.google.com/gsi/client';
      gsiScript.async = true;
      gsiScript.defer = true;
      
      gsiScript.onload = () => {
        // Cargar gapi para Drive API y Picker
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true;
        gapiScript.defer = true;
        
        gapiScript.onload = () => {
          // Cargar módulos client y picker de gapi
          gapi.load('client:picker', {
            callback: async () => {
              // Verificar disponibilidad del Picker API
              const googleApi = (window as any).google;
              if (!googleApi || !googleApi.picker) {
                console.warn('Google Picker API no está disponible');
              }
              
              // Usar llamadas fetch directas en lugar de discoveryDocs
              this.isGapiLoaded = true;
              resolve();
            },
            onerror: () => {
              reject(new Error('Error inicializando cliente y picker'));
            }
          });
        };
        
        gapiScript.onerror = () => reject(new Error('Error cargando gapi'));
        document.head.appendChild(gapiScript);
      };
      
      gsiScript.onerror = () => reject(new Error('Error cargando GSI'));
      document.head.appendChild(gsiScript);
    });
  }

  /**
   * Verifica si las credenciales de Google Cloud están configuradas correctamente.
   * @returns true si CLIENT_ID y API_KEY están configurados
   */
  isConfigured(): boolean {
    return this.CLIENT_ID !== 'TU_CLIENT_ID.apps.googleusercontent.com' 
        && this.API_KEY !== 'TU_API_KEY';
  }

  /**
   * Inicia el flujo de autenticación OAuth 2.0 con Google.
   * Utiliza Google Identity Services para obtener el access token.
   * @returns true si la autenticación fue exitosa
   */
  async authenticate(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        console.error('Google Drive no configurado. Ver guias/GoogleDriveSetup.md');
        return false;
      }

      // Verificar si ya existe un token válido
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        return true;
      }

      // Cargar las librerías de Google
      await this.loadGoogleApi();

      // Iniciar flujo OAuth con Google Identity Services
      return new Promise((resolve) => {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.CLIENT_ID,
          scope: this.SCOPES,
          callback: async (response: any) => {
            if (response.error) {
              console.error('Error en autenticación:', response);
              alert('Error al autenticar con Google Drive: ' + response.error);
              resolve(false);
              return;
            }

            // Almacenar token y tiempo de expiración
            this.accessToken = response.access_token;
            this.tokenExpiry = Date.now() + (response.expires_in * 1000);
            
            if (this.accessToken) {
              localStorage.setItem('drive_access_token', this.accessToken);
              localStorage.setItem('drive_token_expiry', this.tokenExpiry.toString());
            }
            
            // Asegurar que exista la carpeta de productos
            try {
              await this.ensureProductsFolder();
            } catch (error) {
              console.warn('Error creando carpeta de productos:', error);
            }

            resolve(true);
          },
        });

        // Abrir ventana de autenticación
        tokenClient.requestAccessToken({ prompt: '' });
      });

    } catch (error) {
      console.error('Error autenticando con Google Drive:', error);
      return false;
    }
  }

  /**
   * Cierra la sesión de Google Drive y limpia los tokens almacenados.
   */
  async signOut(): Promise<void> {
    try {
      if (this.isGapiLoaded) {
        const authInstance = gapi.auth2.getAuthInstance();
        await authInstance.signOut();
      }
      
      this.accessToken = null;
      this.tokenExpiry = 0;
      localStorage.removeItem('drive_access_token');
      localStorage.removeItem('drive_token_expiry');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  }

  /**
   * Verifica si el usuario tiene una sesión activa con Google Drive.
   * @returns true si existe un token válido no expirado
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && Date.now() < this.tokenExpiry;
  }

  /**
   * Optimiza una imagen convirtiéndola a formato WebP con compresión.
   * Este método es público y puede ser usado antes de subir imágenes.
   * @param dataUrl - Imagen en formato data URL (base64)
   * @param options - Opciones de optimización (calidad, dimensiones máximas)
   * @returns Promise con la imagen optimizada en formato WebP
   */
  async optimizeImage(dataUrl: string, options?: { quality?: number; maxWidth?: number; maxHeight?: number }): Promise<string> {
    return this.convertToWebP(
      dataUrl,
      options?.quality || 0.85,
      options?.maxWidth || 1920,
      options?.maxHeight || 1080
    );
  }

  /**
   * Obtiene información del espacio de almacenamiento de Google Drive del usuario.
   * @returns Objeto con límite, uso y espacio disponible en bytes y GB
   */
  async getStorageInfo(): Promise<StorageInfo | null> {
    try {
      if (!this.isAuthenticated()) {
        await this.authenticate();
      }

      const response = await gapi.client.drive.about.get({
        fields: 'storageQuota'
      });

      const quota = response.result.storageQuota;
      const limit = parseInt(quota.limit);
      const usage = parseInt(quota.usage);
      const available = limit - usage;

      return {
        limit,
        usage,
        available,
        limitGB: (limit / 1e9).toFixed(2) + ' GB',
        usageGB: (usage / 1e9).toFixed(2) + ' GB',
        availableGB: (available / 1e9).toFixed(2) + ' GB'
      };
    } catch (error) {
      console.error('Error obteniendo info de almacenamiento:', error);
      return null;
    }
  }

  /**
   * Asegura que exista la carpeta de productos en Google Drive.
   * Si no existe, la crea. Si existe, retorna su ID.
   * @returns ID de la carpeta de productos
   */
  private async ensureProductsFolder(): Promise<string> {
    try {
      if (this.productsFolderId) {
        return this.productsFolderId;
      }

      const FOLDER_NAME = 'ProyectoApps_Products'; 
      
      // Buscar carpeta existente usando fetch directo
      const searchUrl = `${this.DRIVE_API_URL}/files?` + new URLSearchParams({
        q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error buscando carpeta: ${response.statusText}`);
      }

      const data = await response.json();

      // Si la carpeta existe, usar su ID
      if (data && data.files && data.files.length > 0) {
        this.productsFolderId = data.files[0].id;
        if (this.productsFolderId) {
          localStorage.setItem('products_folder_id', this.productsFolderId);
        }
        return this.productsFolderId!;
      }

      // Si no existe, crear nueva carpeta
      const folderMetadata = {
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Imágenes de productos de la pastelería'
      };

      const createResponse = await fetch(`${this.DRIVE_API_URL}/files?fields=id`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(folderMetadata)
      });

      if (!createResponse.ok) {
        throw new Error(`Error creando carpeta: ${createResponse.statusText}`);
      }

      const folderData = await createResponse.json();
      this.productsFolderId = folderData.id;
      if (this.productsFolderId) {
        localStorage.setItem('products_folder_id', this.productsFolderId);
      }
      
      return this.productsFolderId!;

    } catch (error) {
      console.error('Error creando carpeta de productos:', error);
      throw error;
    }
  }

  /**
   * Abre el selector de archivos de Google Drive (Google Picker).
   * Permite al usuario seleccionar imágenes de su Drive.
   * @returns Información del archivo seleccionado o null si se cancela
   */
  async openPicker(): Promise<DriveFile | null> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.loadGoogleApi();

        const googleApi = (window as any).google;
        if (!googleApi || !googleApi.picker) {
          throw new Error('Google Picker API no está cargado. Recarga la página e intenta de nuevo.');
        }

        if (!this.isAuthenticated()) {
          await this.authenticate();
        }

        const folderId = await this.ensureProductsFolder();

        // Configurar y mostrar el Google Picker
        const picker = new googleApi.picker.PickerBuilder()
          .setAppId(this.CLIENT_ID.split('.')[0])
          .setOAuthToken(this.accessToken!)
          .addView(
            new googleApi.picker.DocsView(googleApi.picker.ViewId.DOCS_IMAGES)
              .setParent(folderId)
              .setMode(googleApi.picker.DocsViewMode.GRID)
          )
          .addView(
            new googleApi.picker.DocsView(googleApi.picker.ViewId.DOCS_IMAGES)
              .setMode(googleApi.picker.DocsViewMode.GRID)
          )
          .setCallback(async (data: any) => {
            if (data.action === googleApi.picker.Action.PICKED) {
              const file = data.docs[0];
              
              // Hacer el archivo público para que pueda visualizarse
              try {
                await this.makeFilePublic(file.id);
                
                // Generar URLs usando formato googleusercontent
                const directLink = `https://lh3.googleusercontent.com/d/${file.id}=w2000`;
                const thumbnailLink = `https://lh3.googleusercontent.com/d/${file.id}=w400`;
                
                resolve({
                  id: file.id,
                  name: file.name,
                  mimeType: file.mimeType,
                  thumbnailLink: thumbnailLink,
                  webViewLink: directLink
                });
              } catch (error) {
                console.error('Error haciendo archivo público:', error);
                // Fallback: usar formato alternativo
                const directLink = `https://drive.google.com/uc?export=view&id=${file.id}`;
                resolve({
                  id: file.id,
                  name: file.name,
                  mimeType: file.mimeType,
                  thumbnailLink: `https://lh3.googleusercontent.com/d/${file.id}`,
                  webViewLink: directLink
                });
              }
            } else if (data.action === googleApi.picker.Action.CANCEL) {
              resolve(null);
            }
          })
          .build();

        picker.setVisible(true);

      } catch (error) {
        console.error('Error abriendo picker:', error);
        reject(error);
      }
    });
  }

  /**
   * Sube una imagen a Google Drive con conversión automática a WebP.
   * La imagen se almacena en la carpeta de productos y se hace pública.
   * @param dataUrl - Imagen en formato data URL (base64)
   * @param filename - Nombre del archivo (se cambiará la extensión a .webp)
   * @returns Información del archivo subido con URLs de acceso público
   */
  async uploadImage(dataUrl: string, filename: string): Promise<DriveFile | null> {
    try {
      if (!this.isAuthenticated()) {
        await this.authenticate();
      }

      const folderId = await this.ensureProductsFolder();

      // Conversión automática a WebP para optimización
      const optimizedDataUrl = await this.convertToWebP(dataUrl);
      
      // Actualizar extensión del archivo
      const webpFilename = filename.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');

      // Convertir dataUrl optimizado a Blob
      const blob = this.dataUrlToBlob(optimizedDataUrl);

      // Preparar metadata del archivo
      const metadata = {
        name: webpFilename,
        mimeType: 'image/webp',
        parents: [folderId]
      };

      // Crear FormData para subida multipart
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      // Ejecutar subida a Drive
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          },
          body: form
        }
      );

      if (!response.ok) {
        throw new Error('Error subiendo archivo a Drive');
      }

      const fileData = await response.json();
      
      // Configurar permisos públicos en el archivo
      try {
        await this.makeFilePublic(fileData.id);
      } catch (error) {
        console.error('Error haciendo archivo público (continuando):', error);
      }

      // Generar URLs de acceso público
      const directLink = `https://lh3.googleusercontent.com/d/${fileData.id}=w2000`;
      const thumbnailLink = `https://lh3.googleusercontent.com/d/${fileData.id}=w400`;

      return {
        id: fileData.id,
        name: fileData.name,
        mimeType: 'image/webp',
        webViewLink: directLink,
        webContentLink: directLink,
        thumbnailLink: thumbnailLink
      };

    } catch (error) {
      console.error('Error subiendo imagen a Drive:', error);
      return null;
    }
  }

  /**
   * Configura permisos públicos en un archivo de Drive.
   * Agrega un delay para permitir la propagación de permisos.
   * @param fileId - ID del archivo en Google Drive
   */
  private async makeFilePublic(fileId: string): Promise<void> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone'
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error configurando permisos públicos:', errorData);
        throw new Error('Error haciendo archivo público');
      }
      
      // Delay para propagación de permisos en servidores de Google
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('No se pudo hacer público el archivo:', error);
      throw error;
    }
  }

  /**
   * Genera URL directa de visualización para un archivo de Drive.
   * Utiliza el formato googleusercontent que funciona mejor con tags <img>.
   * @param fileId - ID del archivo en Google Drive
   * @returns URL pública de la imagen en tamaño completo (2000px ancho)
   */
  getImageUrl(fileId: string): string {
    return `https://lh3.googleusercontent.com/d/${fileId}=w2000`;
  }

  /**
   * Genera URL de thumbnail para un archivo de Drive.
   * @param fileId - ID del archivo en Google Drive
   * @param size - Ancho del thumbnail en píxeles (default: 400)
   * @returns URL pública del thumbnail
   */
  getThumbnailUrl(fileId: string, size: number = 400): string {
    return `https://lh3.googleusercontent.com/d/${fileId}=w${size}`;
  }
  
  /**
   * Genera URL en formato alternativo (uc?export=view).
   * Útil como fallback si el formato googleusercontent no funciona.
   * @param fileId - ID del archivo en Google Drive
   * @returns URL pública en formato alternativo
   */
  getImageUrlAlternative(fileId: string): string {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  /**
   * Listar todas las imágenes de productos
   */
  async listProductImages(): Promise<DriveFile[]> {
    try {
      if (!this.isAuthenticated()) {
        await this.authenticate();
      }

      const folderId = await this.ensureProductsFolder();

      const response = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
        fields: 'files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink)',
        orderBy: 'createdTime desc',
        pageSize: 100
      });

      return response.result.files || [];

    } catch (error) {
      console.error('Error listando imágenes:', error);
      return [];
    }
  }

  /**
   * Elimina un archivo de Google Drive.
   * @param fileId - ID del archivo a eliminar
   * @returns true si se eliminó exitosamente
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        await this.authenticate();
      }

      await gapi.client.drive.files.delete({
        fileId: fileId
      });

      return true;

    } catch (error) {
      console.error('Error eliminando archivo:', error);
      return false;
    }
  }

  /**
   * Convierte una imagen a formato WebP con optimización de tamaño y calidad.
   * Redimensiona la imagen si excede las dimensiones máximas, manteniendo el aspect ratio.
   * La conversión a WebP típicamente reduce el tamaño en 25-35% manteniendo la calidad visual.
   * @param dataUrl - Imagen en formato data URL (base64)
   * @param quality - Calidad de compresión (0.0 - 1.0, default: 0.85)
   * @param maxWidth - Ancho máximo en píxeles (default: 1920)
   * @param maxHeight - Alto máximo en píxeles (default: 1080)
   * @returns Promise con la imagen convertida en formato WebP data URL
   */
  private async convertToWebP(dataUrl: string, quality: number = 0.85, maxWidth: number = 1920, maxHeight: number = 1080): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular dimensiones manteniendo aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Crear canvas para conversión
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear contexto 2D'));
          return;
        }

        // Dibujar imagen optimizada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a WebP con la calidad especificada
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        
        resolve(webpDataUrl);
      };

      img.onerror = () => {
        // Fallback: si falla la conversión, usar imagen original
        resolve(dataUrl);
      };

      img.src = dataUrl;
    });
  }

  /**
   * Convierte un data URL (base64) a objeto Blob.
   * Útil para preparar imágenes para subida con FormData.
   * @param dataUrl - Imagen en formato data URL (data:image/...;base64,...)
   * @returns Blob de la imagen con su tipo MIME correcto
   */
  private dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }
}
