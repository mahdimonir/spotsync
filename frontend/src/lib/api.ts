const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'driver' | 'admin';
}

export interface LoginResponseData {
  token: string;
  user: User;
}

export interface Zone {
  id: number;
  name: string;
  type: 'general' | 'ev_charging' | 'covered';
  total_capacity: number;
  available_spots: number;
  price_per_hour: number;
  created_at: string;
  updated_at?: string;
}

export interface Reservation {
  id: number;
  user_id?: number;
  zone_id: number;
  license_plate: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  zone?: {
    id: number;
    name: string;
    type: 'general' | 'ev_charging' | 'covered';
  };
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let payload: APIResponse<T>;
  try {
    payload = await response.json();
  } catch (e) {
    payload = {
      success: false,
      message: `HTTP Error ${response.status}`,
      errors: response.statusText,
    };
  }

  if (!response.ok) {
    throw payload;
  }

  return payload;
}

export const api = {
  // Authentication
  register: (body: any) => request<User>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<LoginResponseData>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  
  // Zones
  getZones: () => request<Zone[]>('/zones'),
  getZone: (id: number) => request<Zone>(`/zones/${id}`),
  createZone: (body: any) => request<Zone>('/zones', { method: 'POST', body: JSON.stringify(body) }),
  updateZone: (id: number, body: any) => request<Zone>(`/zones/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteZone: (id: number) => request<any>(`/zones/${id}`, { method: 'DELETE' }),
  
  // Reservations
  createReservation: (body: { zone_id: number; license_plate: string }) => 
    request<Reservation>('/reservations', { method: 'POST', body: JSON.stringify(body) }),
  getMyReservations: () => request<Reservation[]>('/reservations/my-reservations'),
  getAllReservations: () => request<Reservation[]>('/reservations'),
  cancelReservation: (id: number) => request<any>(`/reservations/${id}`, { method: 'DELETE' }),
};
