export interface User {
  id: string;
  email: string;
  displayName?: string;
  created_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  service_count?: number;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  base_price: number;
  duration?: number;
  created_at: string;
}

export interface Provider {
  id: string;
  user_id: string;
  business_name?: string;
  description?: string;
  services: string[];
  rating?: number;
  total_jobs?: number;
  is_available: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  service_name?: string;
  customer_name?: string;
  provider_name?: string;
  scheduled_date: string;
  scheduled_time: string;
  address?: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  rating?: number;
  review?: string;
  created_at: string;
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}