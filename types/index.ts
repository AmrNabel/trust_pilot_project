import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { UserCredential } from 'firebase/auth';

// Auth Context Interface
export interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

// Rating type to ensure rating is always 1-5
export type RatingValue = 1 | 2 | 3 | 4 | 5;

// Service Category type for consistent categories
export type ServiceCategory =
  | 'Restaurants'
  | 'Retail'
  | 'Healthcare'
  | 'Technology'
  | 'Education'
  | 'Financial'
  | 'Home Services'
  | 'Professional Services'
  | 'Travel'
  | 'Entertainment'
  | 'Beauty & Spa'
  | 'Automotive'
  | 'Fitness'
  | 'Construction'
  | 'Legal Services'
  | 'Cleaning Services'
  | 'Pet Services'
  | 'Event Planning'
  | 'Photography'
  | 'Barbers & Salons'
  | 'Real Estate'
  | 'Transportation'
  | 'Other';

// Alert interface for feedback to users
export interface AlertMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

// Form input event handlers
export type InputChangeEvent =
  | React.ChangeEvent<HTMLInputElement>
  | React.ChangeEvent<HTMLTextAreaElement>;

export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;
