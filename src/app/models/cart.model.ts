export interface FavoriteItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product; // Referencia al producto completo (opcional)
  createdAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product; // Referencia al producto completo
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: Date;
  notes?: string; // Notas especiales del cliente
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'saved' | 'ordered';
}

// Import necesario para Product
import { Product } from './product.model';