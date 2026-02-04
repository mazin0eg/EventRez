// API configuration and helper functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Types
export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  capacity?: number;
  organizerId?: number;
  categoryId?: number;
  category?: Category;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Reservation {
  id: number;
  userId: number;
  eventId: number;
  status: ReservationStatus;
  numberOfTickets: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  event?: Event;
  user?: User;
}

export interface CreateReservationData {
  eventId: number;
  numberOfTickets?: number;
  notes?: string;
}

export interface UpdateReservationData {
  numberOfTickets?: number;
  notes?: string;
  status?: ReservationStatus;
}

export interface CreateEventData {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  capacity?: number;
  categoryId?: number;
  isPublished?: boolean;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  capacity?: number;
  categoryId?: number;
  isPublished?: boolean;
}

export interface EventAvailability {
  capacity: number | null;
  reserved: number;
  available: number | null;
}

export interface AuthResponse {
  access_token: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Helper function to get the auth token from localStorage
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Helper function to set the auth token
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

// Helper function to remove the auth token
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

// API request helper with authorization header
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth API functions
export const authApi = {
  // POST /auth/register – Register a new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // POST /auth/login – Login and get JWT
  login: async (data: LoginData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// User API functions
export const userApi = {
  // GET /users/me – Get current user (requires Bearer token)
  getMe: async (): Promise<User> => {
    return apiRequest<User>('/users/me', {
      method: 'GET',
    });
  },

  // GET /users/admin – Admin-only route (requires Bearer token + admin role)
  getAdminData: async (): Promise<{ message: string; data: unknown }> => {
    return apiRequest<{ message: string; data: unknown }>('/users/admin', {
      method: 'GET',
    });
  },
};

// Category API functions
export const categoryApi = {
  // GET /categories – Get all categories
  getAll: async (): Promise<Category[]> => {
    return apiRequest<Category[]>('/categories', {
      method: 'GET',
    });
  },

  // GET /categories/:id – Get category by ID
  getById: async (id: number): Promise<Category> => {
    return apiRequest<Category>(`/categories/${id}`, {
      method: 'GET',
    });
  },

  // POST /categories – Create a new category (Admin only)
  create: async (data: { name: string; description?: string }): Promise<Category> => {
    return apiRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PATCH /categories/:id – Update a category (Admin only)
  update: async (id: number, data: { name?: string; description?: string }): Promise<Category> => {
    return apiRequest<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // DELETE /categories/:id – Delete a category (Admin only)
  delete: async (id: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Event API functions
export const eventApi = {
  // GET /events – Get all events (Admin)
  getAll: async (): Promise<Event[]> => {
    return apiRequest<Event[]>('/events', {
      method: 'GET',
    });
  },

  // GET /events/published – Get published events only (Public)
  getPublished: async (): Promise<Event[]> => {
    return apiRequest<Event[]>('/events/published', {
      method: 'GET',
    });
  },

  // GET /events/:id – Get event by ID
  getById: async (id: number): Promise<Event> => {
    return apiRequest<Event>(`/events/${id}`, {
      method: 'GET',
    });
  },

  // POST /events – Create a new event (Admin only)
  create: async (data: CreateEventData): Promise<Event> => {
    return apiRequest<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PATCH /events/:id – Update an event (Admin only)
  update: async (id: number, data: UpdateEventData): Promise<Event> => {
    return apiRequest<Event>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // DELETE /events/:id – Delete an event (Admin only)
  delete: async (id: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  // PATCH /events/:id/publish – Toggle publish status (Admin only)
  togglePublish: async (id: number): Promise<Event> => {
    return apiRequest<Event>(`/events/${id}/publish`, {
      method: 'PATCH',
    });
  },
};

// Reservation API functions
export const reservationApi = {
  // POST /reservations – Create a new reservation
  create: async (data: CreateReservationData): Promise<Reservation> => {
    return apiRequest<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET /reservations/my-reservations – Get user's reservations
  getMyReservations: async (): Promise<Reservation[]> => {
    return apiRequest<Reservation[]>('/reservations/my-reservations', {
      method: 'GET',
    });
  },

  // GET /reservations/availability/:eventId – Get event availability
  getAvailability: async (eventId: number): Promise<EventAvailability> => {
    return apiRequest<EventAvailability>(`/reservations/availability/${eventId}`, {
      method: 'GET',
    });
  },

  // GET /reservations/:id – Get reservation by ID
  getById: async (id: number): Promise<Reservation> => {
    return apiRequest<Reservation>(`/reservations/${id}`, {
      method: 'GET',
    });
  },

  // PATCH /reservations/:id – Update reservation
  update: async (id: number, data: UpdateReservationData): Promise<Reservation> => {
    return apiRequest<Reservation>(`/reservations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // PATCH /reservations/:id/cancel – Cancel reservation
  cancel: async (id: number): Promise<Reservation> => {
    return apiRequest<Reservation>(`/reservations/${id}/cancel`, {
      method: 'PATCH',
    });
  },

  // DELETE /reservations/:id – Delete reservation
  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/reservations/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin endpoints
  // GET /reservations/pending – Get all pending reservations (Admin)
  getPending: async (): Promise<Reservation[]> => {
    return apiRequest<Reservation[]>('/reservations/pending', {
      method: 'GET',
    });
  },

  // GET /reservations/event/:eventId – Get reservations for event (Admin)
  getByEvent: async (eventId: number): Promise<Reservation[]> => {
    return apiRequest<Reservation[]>(`/reservations/event/${eventId}`, {
      method: 'GET',
    });
  },

  // PATCH /reservations/:id/confirm – Confirm reservation (Admin)
  confirm: async (id: number): Promise<Reservation> => {
    return apiRequest<Reservation>(`/reservations/${id}/confirm`, {
      method: 'PATCH',
    });
  },

  // PATCH /reservations/:id/reject – Reject reservation (Admin)
  reject: async (id: number): Promise<Reservation> => {
    return apiRequest<Reservation>(`/reservations/${id}/reject`, {
      method: 'PATCH',
    });
  },
};
