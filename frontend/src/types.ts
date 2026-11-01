export type Role = 'ROLE_STUDENT' | 'ROLE_CANTEEN_OWNER' | 'ROLE_ADMIN';

export type OrderStatus = 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface Student {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  studentCode: string;
  college: string;
  studentIdNumber: string;
  section: string;
  qrCodeData: string;
}

export interface Canteen {
  id: number;
  ownerId: number;
  ownerName: string;
  email: string;
  phone: string;
  canteenName: string;
  canteenCode: string;
  description: string;
  address: string;
  qrCodeData: string;
  active: boolean;
}

export interface FoodCategory {
  id: number;
  name: string;
  active: boolean;
}

export interface FoodItem {
  id: number;
  canteenId: number;
  canteenName: string;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  preparationTime: number;
  isVeg: boolean;
  available: boolean;
  active: boolean;
}

export interface OrderItem {
  id: number;
  foodItemId: number;
  foodNameSnapshot: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  studentId: number;
  studentName: string;
  studentCode: string;
  studentPhone: string;
  canteenId: number;
  canteenName: string;
  canteenCode: string;
  totalAmount: number;
  status: OrderStatus;
  cancellationReason?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CanteenAnalytics {
  totalOrdersToday: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrdersToday: number;
  todayRevenue: number;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  profile: Student | Canteen;
}

