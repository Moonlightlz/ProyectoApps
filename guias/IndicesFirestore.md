# Configuración de Índices de Firestore

## Índice para Productos Destacados

Para que la funcionalidad de productos destacados funcione correctamente, es necesario crear un índice compuesto en Firestore.

### Índice requerido:

**Colección:** `products`

**Campos:**
1. `featured` - Ascending
2. `isAvailable` - Ascending  
3. `createdAt` - Descending

### Cómo crear el índice:

#### Opción 1: Desde la consola de Firebase (Manual)

1. Ve a Firebase Console: https://console.firebase.google.com
2. Selecciona tu proyecto
3. Ve a **Firestore Database**
4. Haz clic en la pestaña **Indexes** (Índices)
5. Haz clic en **Create Index** (Crear índice)
6. Configura:
   - Collection ID: `products`
   - Fields:
     - `featured` → Ascending
     - `isAvailable` → Ascending
     - `createdAt` → Descending
7. Haz clic en **Create**
8. Espera 2-5 minutos a que el índice se construya

#### Opción 2: Desde el error automático

Cuando intentes cargar los productos destacados por primera vez, Firestore te mostrará un error con un enlace directo para crear el índice. Simplemente:

1. Copia el enlace del error
2. Pégalo en el navegador
3. Haz clic en **Create Index**

El enlace será similar a:
```
https://console.firebase.google.com/project/.../firestore/indexes?create_composite=...
```

### Verificar que el índice está activo:

En la consola de Firebase → Firestore Database → Indexes, verás:

✅ **Status:** Enabled (verde)

Si el estado es "Building" (naranja), espera unos minutos.

### Índices adicionales recomendados:

#### Para búsqueda por categoría:
- Collection: `products`
- Fields:
  - `category.id` → Ascending
  - `isAvailable` → Ascending
  - `name` → Ascending

## Fallback automático

El servicio `ProductService` incluye un sistema de fallback que funciona así:

1. **Intento primario:** Query con índice compuesto
2. **Fallback automático:** Si falla, obtiene todos los productos y filtra manualmente

Esto asegura que la funcionalidad siempre funcione, incluso si el índice no está creado aún, aunque con menor rendimiento.

## Notas importantes

- Los índices tardan 2-5 minutos en construirse
- Sin índices, las queries compuestas fallan en Firestore
- El fallback manual funciona pero es más lento con muchos productos
- En producción, **siempre** crea los índices para mejor rendimiento
