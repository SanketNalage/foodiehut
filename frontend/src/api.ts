import { AuthResponse, Canteen, CanteenAnalytics, FoodCategory, FoodItem, Order, Student } from './types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('foodiehut_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const resJson = await response.json();
  if (!response.ok || !resJson.success) {
    const errorMsg = resJson.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return resJson.data as T;
}

export const api = {
  // Auth
  registerStudent: (data: { fullName: string; email: string; phone: string; college?: string; studentIdNumber?: string; section?: string }) =>
    request<Student>('/auth/student/register', { method: 'POST', body: JSON.stringify(data) }),

  requestStudentOtp: (contact: string) =>
    request<string>('/auth/student/request-otp', { method: 'POST', body: JSON.stringify({ contact, role: 'ROLE_STUDENT' }) }),

  verifyStudentOtp: (contact: string, otp: string) =>
    request<AuthResponse>('/auth/student/verify-otp', { method: 'POST', body: JSON.stringify({ contact, otp, role: 'ROLE_STUDENT' }) }),

  registerCanteen: (data: { ownerName: string; canteenName: string; email: string; phone: string; description?: string; address?: string }) =>
    request<Canteen>('/auth/canteen/register', { method: 'POST', body: JSON.stringify(data) }),

  requestCanteenOtp: (contact: string) =>
    request<string>('/auth/canteen/request-otp', { method: 'POST', body: JSON.stringify({ contact, role: 'ROLE_CANTEEN_OWNER' }) }),

  verifyCanteenOtp: (contact: string, otp: string) =>
    request<AuthResponse>('/auth/canteen/verify-otp', { method: 'POST', body: JSON.stringify({ contact, otp, role: 'ROLE_CANTEEN_OWNER' }) }),

  // Canteens
  getAllCanteens: () => request<Canteen[]>('/canteens'),
  getCanteenByCode: (code: string) => request<Canteen>(`/canteens/${code}`),
  getCanteenMenu: (code: string) => request<FoodItem[]>(`/canteens/${code}/menu`),
  getCanteenProfile: () => request<Canteen>('/canteens/me'),
  updateCanteenProfile: (data: any) => request<Canteen>('/canteens/me', { method: 'PUT', body: JSON.stringify(data) }),
  getCanteenAnalytics: () => request<CanteenAnalytics>('/canteens/me/analytics'),
  getCanteenOrders: () => request<Order[]>('/canteens/me/orders'),
  updateOrderStatus: (orderId: number, status: string, cancellationReason?: string) =>
    request<Order>(`/canteens/me/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status, cancellationReason }) }),

  // Student
  getStudentProfile: () => request<Student>('/students/me'),
  updateStudentProfile: (data: any) => request<Student>('/students/me', { method: 'PUT', body: JSON.stringify(data) }),
  getStudentOrders: () => request<Order[]>('/students/me/orders'),
  getStudentOrder: (orderId: number) => request<Order>(`/students/me/orders/${orderId}`),

  // Food
  getCategories: () => request<FoodCategory[]>('/categories'),
  getOwnerFoodItems: () => request<FoodItem[]>('/canteens/me/foods'),
  addFoodItem: (data: any) => request<FoodItem>('/canteens/me/foods', { method: 'POST', body: JSON.stringify(data) }),
  updateFoodItem: (foodId: number, data: any) => request<FoodItem>(`/canteens/me/foods/${foodId}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleFoodAvailability: (foodId: number, available: boolean) =>
    request<FoodItem>(`/canteens/me/foods/${foodId}/availability`, { method: 'PATCH', body: JSON.stringify({ available }) }),
  deleteFoodItem: (foodId: number) => request<void>(`/canteens/me/foods/${foodId}`, { method: 'DELETE' }),

  // Orders
  placeOrder: (data: { canteenCode: string; items: { foodItemId: number; quantity: number }[] }) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrderById: (orderId: number) => request<Order>(`/orders/${orderId}`),
};
