export interface Order {
  id: string;
  orderCode: string; // Código único del pedido (ej: ORD-2024-001234)
  userId: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalItems: number;
  subtotal: number;
  igv: number; // 18%
  deliveryInfo?: DeliveryInfo;
  deliveryCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  statusHistory: OrderStatusChange[];
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: Date;
  confirmedAt?: Date; // Cuando se confirma después del minuto
  estimatedDeliveryTime?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface DeliveryInfo {
  address: string;
  distance: 'near' | 'medium' | 'far';
  distanceLabel: string;
  instructions?: string;
  estimatedTime?: string;
}

export enum OrderStatus {
  PENDING_CONFIRMATION = 'pending_confirmation', // Esperando confirmación del cliente (1 minuto)
  CONFIRMED = 'confirmed', // Confirmado, esperando preparación
  PREPARING = 'preparing', // En preparación
  READY = 'ready', // Listo para entrega/recojo
  IN_DELIVERY = 'in_delivery', // En camino (solo delivery)
  COMPLETED = 'completed', // Entregado/Completado
  CANCELLED = 'cancelled' // Cancelado
}

export interface OrderStatusChange {
  status: OrderStatus;
  changedBy: string; // userId o 'system' o 'admin'
  changedByName: string;
  timestamp: Date;
  notes?: string;
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  YAPE = 'yape',
  PLIN = 'plin',
  TRANSFER = 'transfer'
}

// Helper para obtener el label del estado
export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_CONFIRMATION]: '⏳ Pendiente de Confirmación',
  [OrderStatus.CONFIRMED]: '✅ Confirmado',
  [OrderStatus.PREPARING]: '👨‍🍳 En Preparación',
  [OrderStatus.READY]: '📦 Listo',
  [OrderStatus.IN_DELIVERY]: '🚗 En Camino',
  [OrderStatus.COMPLETED]: '✨ Completado',
  [OrderStatus.CANCELLED]: '❌ Cancelado'
};

// Helper para obtener el color del estado
export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_CONFIRMATION]: 'warning',
  [OrderStatus.CONFIRMED]: 'success',
  [OrderStatus.PREPARING]: 'primary',
  [OrderStatus.READY]: 'tertiary',
  [OrderStatus.IN_DELIVERY]: 'secondary',
  [OrderStatus.COMPLETED]: 'success',
  [OrderStatus.CANCELLED]: 'danger'
};

// Helper para generar código de pedido
export function generateOrderCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `ORD-${year}${month}${day}-${random}`;
}
