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
  // ✅ Credenciales configuradas de Google Cloud Console
  // Ver guía: guias/GoogleDriveSetup.md
  private CLIENT_ID = '134621478329-6cj15n0fevmmv6c2pisrnjtvqr5a8st2.apps.googleusercontent.com';
  private API_KEY = 'AIzaSyDo7sejiP9Wdz99lbc0zeZfFwg6Yu7fSw0';
  
  private SCOPES = 'https://www.googleapis.com/auth/drive.file';
  
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private isGapiLoaded = false;
  private productsFolderId: string | null = null;
  
  // URLs directas de la API (sin Discovery Document)
  private readonly DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';

  constructor() {
    this.loadStoredToken();
  }

  /**
   * Cargar token guardado de localStorage
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
   * Cargar Google Identity Services (GIS) - Nuevo método
   */
  private async loadGoogleApi(): Promise<void> {
    if (this.isGapiLoaded) {
      return;
    }

    return new Promise((resolve, reject) => {
      // Cargar Google Identity Services (GSI)
      const gsiScript = document.createElement('script');
      gsiScript.src = 'https://accounts.google.com/gsi/client';
      gsiScript.async = true;
      gsiScript.defer = true;
      
      gsiScript.onload = () => {
        console.log('✅ Google Identity Services cargado');
        
        // Cargar gapi para Drive API y Picker
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true;
        gapiScript.defer = true;
        
        gapiScript.onload = () => {
          // Cargar client y picker
          gapi.load('client:picker', {
            callback: async () => {
              console.log('✅ Google API Client y Picker cargados');
              
              // Verificar que picker esté disponible
              const googleApi = (window as any).google;
              if (googleApi && googleApi.picker) {
                console.log('✅ Google Picker API disponible');
              } else {
                console.warn('⚠️ Google Picker API no detectado inmediatamente');
              }
              
              // No usar discoveryDocs para evitar error 502
              // Usaremos fetch directo con la API de Drive
              this.isGapiLoaded = true;
              console.log('✅ Listo para autenticar (con Picker API)');
              resolve();
            },
            onerror: () => {
              console.error('❌ Error inicializando cliente y picker');
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
   * Verificar si las credenciales están configuradas
   */
  isConfigured(): boolean {
    return this.CLIENT_ID !== 'TU_CLIENT_ID.apps.googleusercontent.com' 
        && this.API_KEY !== 'TU_API_KEY';
  }

  /**
   * Autenticar con cuenta de Google
   */
  async authenticate(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        console.error('⚠️ Google Drive no configurado. Ver guias/GoogleDriveSetup.md');
        return false;
      }

      // Verificar si ya hay token válido
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        console.log('✅ Token de Google Drive válido');
        return true;
      }

      // Cargar APIs con el nuevo sistema
      console.log('🔄 Cargando Google Identity Services...');
      await this.loadGoogleApi();

      // Usar Google Identity Services (GIS) para autenticación
      return new Promise((resolve) => {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.CLIENT_ID,
          scope: this.SCOPES,
          callback: async (response: any) => {
            if (response.error) {
              console.error('❌ Error en autenticación:', response);
              alert('Error al autenticar con Google Drive: ' + response.error);
              resolve(false);
              return;
            }

            // Guardar token
            this.accessToken = response.access_token;
            this.tokenExpiry = Date.now() + (response.expires_in * 1000);
            
            if (this.accessToken) {
              localStorage.setItem('drive_access_token', this.accessToken);
              localStorage.setItem('drive_token_expiry', this.tokenExpiry.toString());
            }

            console.log('✅ Autenticado con Google Drive correctamente');
            
            // Crear carpeta de productos
            try {
              await this.ensureProductsFolder();
              console.log('✅ Carpeta de productos lista');
            } catch (error) {
              console.warn('⚠️ Error creando carpeta:', error);
            }

            resolve(true);
          },
        });

        // Solicitar token de acceso
        console.log('🔐 Abriendo ventana de autenticación de Google...');
        tokenClient.requestAccessToken({ prompt: '' });
      });

    } catch (error) {
      console.error('Error autenticando con Google Drive:', error);
      return false;
    }
  }

  /**
   * Cerrar sesión de Google Drive
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
      
      console.log('✅ Sesión de Google Drive cerrada');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && Date.now() < this.tokenExpiry;
  }

  /**
   * Optimizar imagen a WebP (método público)
   * Usar antes de subir imágenes para reducir tamaño
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
   * Obtener información de almacenamiento
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
   * Crear carpeta de productos si no existe
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
        const errorText = await response.text();
        console.error('❌ Error HTTP buscando carpeta:', response.status, errorText);
        throw new Error(`Error buscando carpeta: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📁 Respuesta búsqueda carpeta:', data);

      if (data && data.files && data.files.length > 0) {
        this.productsFolderId = data.files[0].id;
        if (this.productsFolderId) {
          localStorage.setItem('products_folder_id', this.productsFolderId);
        }
        console.log('✅ Carpeta de productos encontrada:', this.productsFolderId);
        return this.productsFolderId!;
      }

      // Crear nueva carpeta usando fetch directo
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
      console.log('✅ Carpeta de productos creada:', this.productsFolderId);
      
      return this.productsFolderId!;

    } catch (error) {
      console.error('Error creando carpeta de productos:', error);
      throw error;
    }
  }

  /**
   * Abrir selector de Google Drive (Google Picker)
   */
  async openPicker(): Promise<DriveFile | null> {
    return new Promise(async (resolve, reject) => {
      try {
        // Asegurarse de que Google API esté cargado
        await this.loadGoogleApi();

        // Verificar que google.picker esté disponible
        const googleApi = (window as any).google;
        if (!googleApi || !googleApi.picker) {
          throw new Error('Google Picker API no está cargado. Recarga la página e intenta de nuevo.');
        }

        if (!this.isAuthenticated()) {
          await this.authenticate();
        }

        const folderId = await this.ensureProductsFolder();

        console.log('🎨 Abriendo Google Picker...');

        // Crear Google Picker usando el objeto global
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
          // API Key comentado temporalmente - el Picker funciona sin él si estás autenticado
          // .setDeveloperKey(this.API_KEY)
          .setCallback(async (data: any) => {
            if (data.action === googleApi.picker.Action.PICKED) {
              const file = data.docs[0];
              console.log('✅ Archivo seleccionado:', file);
              
              // Hacer el archivo público si no lo es
              try {
                await this.makeFilePublic(file.id);
                
                // Generar URLs directas (públicas)
                // Usar formato googleusercontent que funciona mejor para imágenes
                const directLink = `https://lh3.googleusercontent.com/d/${file.id}=w2000`;
                const thumbnailLink = `https://lh3.googleusercontent.com/d/${file.id}=w400`;
                
                console.log('🖼️ URL generada (googleusercontent):', directLink);
                console.log('🔍 Thumbnail:', thumbnailLink);
                
                resolve({
                  id: file.id,
                  name: file.name,
                  mimeType: file.mimeType,
                  thumbnailLink: thumbnailLink,
                  webViewLink: directLink
                });
              } catch (error) {
                console.error('❌ Error haciendo archivo público:', error);
                // Intentar usar el archivo de todas formas
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
              console.log('❌ Usuario canceló la selección');
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
   * Subir imagen a Google Drive
   */
  async uploadImage(dataUrl: string, filename: string): Promise<DriveFile | null> {
    try {
      if (!this.isAuthenticated()) {
        await this.authenticate();
      }

      const folderId = await this.ensureProductsFolder();

      // 🎨 CONVERSIÓN AUTOMÁTICA A WEBP
      console.log('🔄 Optimizando imagen a WebP...');
      const optimizedDataUrl = await this.convertToWebP(dataUrl);
      
      // Cambiar extensión del nombre de archivo a .webp
      const webpFilename = filename.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');

      // Convertir dataUrl optimizado a Blob
      const blob = this.dataUrlToBlob(optimizedDataUrl);

      // Metadata del archivo
      const metadata = {
        name: webpFilename,
        mimeType: 'image/webp',
        parents: [folderId]
      };

      // Crear FormData para multipart upload
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      // Subir archivo
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
      
      // Hacer el archivo público para poder visualizarlo
      try {
        await this.makeFilePublic(fileData.id);
      } catch (error) {
        console.error('⚠️ Error haciendo archivo público (continuando):', error);
      }

      // Obtener URL de descarga directa (pública)
      // Usar formato googleusercontent que funciona mejor para imágenes
      const directLink = `https://lh3.googleusercontent.com/d/${fileData.id}=w2000`;
      const thumbnailLink = `https://lh3.googleusercontent.com/d/${fileData.id}=w400`;

      console.log('✅ Imagen subida a Drive:', fileData.name);
      console.log('🔗 URL directa (googleusercontent):', directLink);
      console.log('🔍 Thumbnail:', thumbnailLink);

      return {
        id: fileData.id,
        name: fileData.name,
        mimeType: 'image/webp',
        webViewLink: directLink, // URL que funciona en <img>
        webContentLink: directLink,
        thumbnailLink: thumbnailLink
      };

    } catch (error) {
      console.error('Error subiendo imagen a Drive:', error);
      return null;
    }
  }

  /**
   * Hacer archivo público para visualización
   */
  private async makeFilePublic(fileId: string): Promise<void> {
    try {
      console.log('🔓 Haciendo archivo público:', fileId);
      
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
        console.error('❌ Error haciendo archivo público:', errorData);
        throw new Error('Error haciendo archivo público');
      }

      console.log('✅ Archivo ahora es público');
      
      // Dar tiempo a que Google Drive propague los permisos
      // Esto es crítico para que las URLs funcionen inmediatamente
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('⏱️ Permisos propagados');
      
    } catch (error) {
      console.error('⚠️ No se pudo hacer público el archivo:', error);
      throw error;
    }
  }

  /**
   * Obtener URL directa de visualización
   * Este formato funciona mejor para archivos públicos
   */
  getImageUrl(fileId: string): string {
    // Usar formato de Google User Content con tamaño completo
    return `https://lh3.googleusercontent.com/d/${fileId}=w2000`;
  }

  /**
   * Obtener URL de thumbnail (formato alternativo)
   */
  getThumbnailUrl(fileId: string, size: number = 400): string {
    return `https://lh3.googleusercontent.com/d/${fileId}=w${size}`;
  }
  
  /**
   * Obtener URL en formato alternativo (uc?export=view)
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
   * Eliminar archivo de Drive
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        await this.authenticate();
      }

      await gapi.client.drive.files.delete({
        fileId: fileId
      });

      console.log('✅ Archivo eliminado de Drive');
      return true;

    } catch (error) {
      console.error('Error eliminando archivo:', error);
      return false;
    }
  }

  /**
   * Convertir imagen a WebP (optimización automática)
   * Reduce tamaño 25-35% manteniendo calidad
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

        // Convertir a WebP
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        
        // Calcular reducción de tamaño
        const originalSize = dataUrl.length;
        const webpSize = webpDataUrl.length;
        const reduction = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
        
        console.log(`📦 Optimización WebP: ${reduction}% más pequeño (${width}x${height})`);
        
        resolve(webpDataUrl);
      };

      img.onerror = () => {
        console.warn('⚠️ Error convirtiendo a WebP, usando original');
        resolve(dataUrl); // Fallback a imagen original
      };

      img.src = dataUrl;
    });
  }

  /**
   * Convertir dataUrl a Blob
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
