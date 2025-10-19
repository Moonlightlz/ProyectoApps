export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  imageUrl: string;
  images?: string[];
  category: ProductCategory;
  categoryId: string;
  isAvailable: boolean;
  featured?: boolean;
  preparationTime?: number; // en minutos
  servingSize?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // UID del admin que lo creó
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: NutritionalInfo;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string; // Ej: "Pequeño", "Mediano", "Grande"
  price: number;
  isAvailable: boolean;
}

export interface NutritionalInfo {
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  sugar: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number; // Para ordenar las categorías
  isActive: boolean;
}

// Categorías predefinidas para la pastelería
export const DEFAULT_CATEGORIES: Omit<ProductCategory, 'id'>[] = [
  {
    name: '🎂 Pasteles',
    description: 'Pasteles para toda ocasión',
    icon: 'cake',
    order: 1,
    isActive: true
  },
  {
    name: '🧁 Cupcakes',
    description: 'Cupcakes individuales',
    icon: 'cupcake',
    order: 2,
    isActive: true
  },
  {
    name: '🍪 Galletas',
    description: 'Galletas artesanales',
    icon: 'cookie',
    order: 3,
    isActive: true
  },
  {
    name: '🥐 Panes',
    description: 'Panes y productos horneados',
    icon: 'bread',
    order: 4,
    isActive: true
  },
  {
    name: '🍰 Postres',
    description: 'Postres especiales',
    icon: 'dessert',
    order: 5,
    isActive: true
  },
  {
    name: '☕ Bebidas',
    description: 'Cafés, tés y bebidas',
    icon: 'coffee',
    order: 6,
    isActive: true
  }
];

// Interfaces para operaciones CRUD
export interface CreateProductRequest {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  categoryId: string;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: NutritionalInfo;
  variants?: Omit<ProductVariant, 'id'>[];
  featured?: boolean;
  preparationTime?: number;
  servingSize?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  imageUrl?: string;
  images?: string[];
  categoryId?: string;
  isAvailable?: boolean;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: NutritionalInfo;
  variants?: ProductVariant[];
  featured?: boolean;
  preparationTime?: number;
  servingSize?: string;
}