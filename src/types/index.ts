export type UserRole = 'owner' | 'walker';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  notes?: string;
}

export interface Walker {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  distance: number;
  price: number;
  bio: string;
  verified: boolean;
  tags: string[];
  completedWalks: number;
  creditScore?: number;
}

export type ServiceType = 'walk' | 'boarding' | 'grooming' | 'feeding';
export type OrderUrgency = 'instant' | 'scheduled';

export interface Order {
  id: string;
  walkerId: string;
  walkerName: string;
  petName: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
}

export interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: number;
}
