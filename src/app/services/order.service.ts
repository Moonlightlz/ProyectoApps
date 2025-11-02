import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, Timestamp } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { Order, OrderStatus, OrderStatusChange, generateOrderCode, CustomerInfo, OrderItem } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private userOrdersSubject = new BehaviorSubject<Order[]>([]);
  public userOrders$ = this.userOrdersSubject.asObservable();

  private allOrdersSubject = new BehaviorSubject<Order[]>([]);
  public allOrders$ = this.allOrdersSubject.asObservable();

  private pendingOrderSubject = new BehaviorSubject<Order | null>(null);
  public pendingOrder$ = this.pendingOrderSubject.asObservable();

  private unsubscribeOrders: (() => void) | null = null;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private userService: UserService
  ) {}

  /**
   * Crear un nuevo pedido desde el carrito
   */
  async createOrderFromCart(
    cart: Cart,
    deliveryInfo: { 
      includeDelivery: boolean; 
      deliveryCost: number; 
      selectedDistance?: 'near' | 'medium' | 'far';
      address?: string;
      instructions?: string;
    },
    paymentMethod?: string,
    notes?: string,
    customerPhone?: string
  ): Promise<Order> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('📝 Creando pedido desde carrito...');

      // Obtener información del usuario
      const userData = await this.userService.getUserProfile(user.uid);
      
      const customerInfo: CustomerInfo = {
        name: userData?.profile?.name || user.displayName || 'Cliente',
        email: user.email || '',
        phone: customerPhone || userData?.profile?.phone,
        address: deliveryInfo.address || userData?.profile?.address?.street
      };
      
      console.log('📞 Teléfono usado para el pedido:', customerInfo.phone);

      // Convertir items del carrito a items del pedido
      const orderItems: OrderItem[] = cart.items.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.imageUrl,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes
      }));

      // Calcular IGV (18%)
      const subtotalWithoutIGV = cart.subtotal / 1.18;
      const igv = subtotalWithoutIGV * 0.18;

      // Generar código único de pedido
      const orderCode = generateOrderCode();

      // Crear el pedido
      const newOrder: Omit<Order, 'id'> = {
        orderCode: orderCode,
        userId: user.uid,
        customerInfo: customerInfo,
        items: orderItems,
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        igv: igv,
        deliveryCost: deliveryInfo.deliveryCost,
        discount: cart.discount || 0,
        total: cart.subtotal + deliveryInfo.deliveryCost - (cart.discount || 0),
        status: OrderStatus.PENDING_CONFIRMATION,
        statusHistory: [
          {
            status: OrderStatus.PENDING_CONFIRMATION,
            changedBy: user.uid,
            changedByName: customerInfo.name,
            timestamp: new Date(),
            notes: 'Pedido creado - Esperando confirmación del cliente'
          }
        ],
        paymentMethod: paymentMethod as any,
        notes: notes,
        createdAt: new Date()
      };

      // Agregar información de delivery si aplica
      if (deliveryInfo.includeDelivery && deliveryInfo.selectedDistance) {
        const distanceLabels = {
          near: '0-2 km',
          medium: '2-4 km',
          far: '4-6 km'
        };

        newOrder.deliveryInfo = {
          address: deliveryInfo.address || customerInfo.address || 'No especificada',
          distance: deliveryInfo.selectedDistance,
          distanceLabel: distanceLabels[deliveryInfo.selectedDistance],
          instructions: deliveryInfo.instructions,
          estimatedTime: this.calculateEstimatedDeliveryTime(deliveryInfo.selectedDistance)
        };
      }

      // Preparar datos para Firestore (eliminar undefined)
      const orderData: any = {
        orderCode: newOrder.orderCode,
        userId: newOrder.userId,
        customerInfo: {
          name: newOrder.customerInfo.name,
          email: newOrder.customerInfo.email,
          ...(newOrder.customerInfo.phone && { phone: newOrder.customerInfo.phone }),
          ...(newOrder.customerInfo.address && { address: newOrder.customerInfo.address })
        },
        items: newOrder.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          ...(item.productImage && { productImage: item.productImage }),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          ...(item.notes && { notes: item.notes })
        })),
        totalItems: newOrder.totalItems,
        subtotal: newOrder.subtotal,
        igv: newOrder.igv,
        deliveryCost: newOrder.deliveryCost,
        discount: newOrder.discount,
        total: newOrder.total,
        status: newOrder.status,
        statusHistory: newOrder.statusHistory.map(sh => ({
          status: sh.status,
          changedBy: sh.changedBy,
          changedByName: sh.changedByName,
          timestamp: Timestamp.fromDate(sh.timestamp),
          ...(sh.notes && { notes: sh.notes })
        })),
        ...(newOrder.paymentMethod && { paymentMethod: newOrder.paymentMethod }),
        ...(newOrder.notes && { notes: newOrder.notes }),
        createdAt: Timestamp.fromDate(newOrder.createdAt)
      };

      // Agregar deliveryInfo si existe
      if (newOrder.deliveryInfo) {
        orderData.deliveryInfo = {
          address: newOrder.deliveryInfo.address,
          distance: newOrder.deliveryInfo.distance,
          distanceLabel: newOrder.deliveryInfo.distanceLabel,
          ...(newOrder.deliveryInfo.instructions && { instructions: newOrder.deliveryInfo.instructions }),
          ...(newOrder.deliveryInfo.estimatedTime && { estimatedTime: newOrder.deliveryInfo.estimatedTime })
        };
      }

      // Guardar en Firestore
      const ordersRef = collection(this.firestore, 'orders');
      const docRef = await addDoc(ordersRef, orderData);

      const order: Order = { ...newOrder, id: docRef.id };

      console.log(`✅ Pedido creado exitosamente: ${orderCode}`);
      
      // Establecer como pedido pendiente
      this.pendingOrderSubject.next(order);

      // Iniciar timer de confirmación automática (1 minuto)
      this.startConfirmationTimer(order.id);

      return order;

    } catch (error) {
      console.error('Error creando pedido:', error);
      throw error;
    }
  }

  /**
   * Timer de confirmación automática (1 minuto)
   */
  private startConfirmationTimer(orderId: string) {
    console.log('⏰ Iniciando timer de confirmación de 1 minuto...');
    
    setTimeout(async () => {
      try {
        // Verificar si el pedido sigue en estado PENDING_CONFIRMATION
        const orderRef = doc(this.firestore, `orders/${orderId}`);
        const orderDoc = await getDoc(orderRef);
        
        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          
          if (orderData['status'] === OrderStatus.PENDING_CONFIRMATION) {
            console.log('✅ Confirmando pedido automáticamente...');
            await this.updateOrderStatus(
              orderId, 
              OrderStatus.CONFIRMED, 
              'system',
              'Sistema',
              'Confirmado automáticamente después de 1 minuto'
            );
          }
        }
      } catch (error) {
        console.error('Error en timer de confirmación:', error);
      }
    }, 60000); // 60 segundos
  }

  /**
   * Calcular tiempo estimado de entrega
   */
  private calculateEstimatedDeliveryTime(distance: 'near' | 'medium' | 'far'): string {
    const preparationTime = 30; // 30 minutos de preparación base
    
    const deliveryTimes = {
      near: 15,   // 15 minutos
      medium: 25, // 25 minutos
      far: 40     // 40 minutos
    };

    const totalMinutes = preparationTime + deliveryTimes[distance];
    
    return `${totalMinutes} minutos`;
  }

  /**
   * Actualizar estado del pedido
   */
  async updateOrderStatus(
    orderId: string, 
    newStatus: OrderStatus, 
    changedBy: string,
    changedByName: string,
    notes?: string
  ): Promise<void> {
    try {
      console.log(`📝 Actualizando estado del pedido ${orderId} a ${newStatus}`);

      const orderRef = doc(this.firestore, `orders/${orderId}`);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        throw new Error('Pedido no encontrado');
      }

      const orderData = orderDoc.data();
      const statusHistory = orderData['statusHistory'] || [];

      // Agregar nuevo cambio al historial
      const statusChange: OrderStatusChange = {
        status: newStatus,
        changedBy: changedBy,
        changedByName: changedByName,
        timestamp: new Date(),
        notes: notes
      };

      statusHistory.push({
        ...statusChange,
        timestamp: Timestamp.fromDate(statusChange.timestamp)
      });

      // Preparar actualización
      const updateData: any = {
        status: newStatus,
        statusHistory: statusHistory
      };

      // Agregar campos específicos según el estado
      if (newStatus === OrderStatus.CONFIRMED) {
        updateData.confirmedAt = Timestamp.now();
      } else if (newStatus === OrderStatus.COMPLETED) {
        updateData.completedAt = Timestamp.now();
      } else if (newStatus === OrderStatus.CANCELLED) {
        updateData.cancelledAt = Timestamp.now();
        if (notes) {
          updateData.cancellationReason = notes;
        }
      }

      await updateDoc(orderRef, updateData);

      console.log(`✅ Estado actualizado a ${newStatus}`);

      // Si era el pedido pendiente y se confirmó/canceló, limpiar
      const pendingOrder = this.pendingOrderSubject.value;
      if (pendingOrder && pendingOrder.id === orderId) {
        if (newStatus !== OrderStatus.PENDING_CONFIRMATION) {
          this.pendingOrderSubject.next(null);
        }
      }

    } catch (error) {
      console.error('Error actualizando estado:', error);
      throw error;
    }
  }

  /**
   * Cargar pedidos del usuario
   */
  async loadUserOrders(): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        console.log('❌ No hay usuario logueado para cargar pedidos');
        return;
      }

      console.log('📦 Cargando pedidos del usuario:', user.uid);

      const ordersRef = collection(this.firestore, 'orders');
      // Query sin orderBy para evitar necesidad de índice compuesto
      // Los pedidos se ordenarán manualmente en el código
      const q = query(
        ordersRef,
        where('userId', '==', user.uid)
      );

      // Suscribirse a cambios en tiempo real
      this.unsubscribeOrders = onSnapshot(
        q, 
        (snapshot) => {
          const orders: Order[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data();
            const order: Order = {
              id: doc.id,
              orderCode: data['orderCode'],
              userId: data['userId'],
              customerInfo: data['customerInfo'],
              items: data['items'],
              totalItems: data['totalItems'],
              subtotal: data['subtotal'],
              igv: data['igv'],
              deliveryInfo: data['deliveryInfo'],
              deliveryCost: data['deliveryCost'],
              discount: data['discount'],
              total: data['total'],
              status: data['status'],
              statusHistory: data['statusHistory']?.map((sh: any) => ({
                ...sh,
                timestamp: sh.timestamp?.toDate()
              })) || [],
              paymentMethod: data['paymentMethod'],
              notes: data['notes'],
              createdAt: data['createdAt']?.toDate(),
              confirmedAt: data['confirmedAt']?.toDate(),
              estimatedDeliveryTime: data['estimatedDeliveryTime']?.toDate(),
              completedAt: data['completedAt']?.toDate(),
              cancelledAt: data['cancelledAt']?.toDate(),
              cancellationReason: data['cancellationReason']
            };

            orders.push(order);
          });

          // Ordenar manualmente por fecha de creación (más reciente primero)
          orders.sort((a, b) => {
            const dateA = a.createdAt?.getTime() || 0;
            const dateB = b.createdAt?.getTime() || 0;
            return dateB - dateA;
          });

          this.userOrdersSubject.next(orders);
          console.log(`📦 ${orders.length} pedidos cargados del usuario`);
        },
        (error) => {
          console.error('❌ Error en onSnapshot de pedidos:', error);
          // Si es un error de índice, mostrar URL para crear el índice
          if (error.code === 'failed-precondition' || error.message?.includes('index')) {
            console.error('⚠️ Necesitas crear un índice compuesto en Firestore');
            console.error('La consola de Firebase debería mostrar un enlace para crearlo');
          }
        }
      );

    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  }

  /**
   * Cargar todos los pedidos (para admin)
   */
  async loadAllOrders(): Promise<void> {
    try {
      console.log('📦 Cargando todos los pedidos (admin)...');

      const ordersRef = collection(this.firestore, 'orders');
      // Query sin orderBy para evitar necesidad de índice
      const q = query(ordersRef);

      this.unsubscribeOrders = onSnapshot(
        q, 
        (snapshot) => {
          const orders: Order[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data();
            const order: Order = {
              id: doc.id,
              orderCode: data['orderCode'],
              userId: data['userId'],
              customerInfo: data['customerInfo'],
              items: data['items'],
              totalItems: data['totalItems'],
              subtotal: data['subtotal'],
              igv: data['igv'],
              deliveryInfo: data['deliveryInfo'],
              deliveryCost: data['deliveryCost'],
              discount: data['discount'],
              total: data['total'],
              status: data['status'],
              statusHistory: data['statusHistory']?.map((sh: any) => ({
                ...sh,
                timestamp: sh.timestamp?.toDate()
              })) || [],
              paymentMethod: data['paymentMethod'],
              notes: data['notes'],
              createdAt: data['createdAt']?.toDate(),
              confirmedAt: data['confirmedAt']?.toDate(),
              estimatedDeliveryTime: data['estimatedDeliveryTime']?.toDate(),
              completedAt: data['completedAt']?.toDate(),
              cancelledAt: data['cancelledAt']?.toDate(),
              cancellationReason: data['cancellationReason']
            };

            orders.push(order);
          });

          // Ordenar manualmente por fecha de creación (más reciente primero)
          orders.sort((a, b) => {
            const dateA = a.createdAt?.getTime() || 0;
            const dateB = b.createdAt?.getTime() || 0;
            return dateB - dateA;
          });

          this.allOrdersSubject.next(orders);
          console.log(`📦 ${orders.length} pedidos totales cargados (admin)`);
        },
        (error) => {
          console.error('❌ Error en onSnapshot de todos los pedidos:', error);
          if (error.code === 'failed-precondition' || error.message?.includes('index')) {
            console.error('⚠️ Necesitas crear un índice compuesto en Firestore');
          }
        }
      );

    } catch (error) {
      console.error('Error cargando todos los pedidos:', error);
    }
  }

  /**
   * Obtener un pedido específico
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(this.firestore, `orders/${orderId}`);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        return null;
      }

      const data = orderDoc.data();
      const order: Order = {
        id: orderDoc.id,
        orderCode: data['orderCode'],
        userId: data['userId'],
        customerInfo: data['customerInfo'],
        items: data['items'],
        totalItems: data['totalItems'],
        subtotal: data['subtotal'],
        igv: data['igv'],
        deliveryInfo: data['deliveryInfo'],
        deliveryCost: data['deliveryCost'],
        discount: data['discount'],
        total: data['total'],
        status: data['status'],
        statusHistory: data['statusHistory']?.map((sh: any) => ({
          ...sh,
          timestamp: sh.timestamp?.toDate()
        })) || [],
        paymentMethod: data['paymentMethod'],
        notes: data['notes'],
        createdAt: data['createdAt']?.toDate(),
        confirmedAt: data['confirmedAt']?.toDate(),
        estimatedDeliveryTime: data['estimatedDeliveryTime']?.toDate(),
        completedAt: data['completedAt']?.toDate(),
        cancelledAt: data['cancelledAt']?.toDate(),
        cancellationReason: data['cancellationReason']
      };

      return order;

    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      return null;
    }
  }

  /**
   * Cancelar pedido (solo si está en PENDING_CONFIRMATION)
   */
  async cancelOrder(orderId: string, reason: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    await this.updateOrderStatus(
      orderId,
      OrderStatus.CANCELLED,
      user.uid,
      user.displayName || 'Cliente',
      reason
    );
  }

  /**
   * Limpiar suscripciones
   */
  unsubscribe() {
    if (this.unsubscribeOrders) {
      this.unsubscribeOrders();
      this.unsubscribeOrders = null;
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
  }
}
