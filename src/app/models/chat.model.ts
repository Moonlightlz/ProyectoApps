//Diseño del chat con el cliente.
export interface ChatMessage {
  id?: string;
  orderId: string;
  orderCode: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  isAdmin: boolean;
  message: string;
  timestamp: Date;
  read: boolean;
}



export interface ChatConversation {
  id?: string;
  orderId: string;
  orderCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCountUser: number;
  unreadCountAdmin: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnreadCount {
  total: number;
  byOrder: { [orderId: string]: number };
}
