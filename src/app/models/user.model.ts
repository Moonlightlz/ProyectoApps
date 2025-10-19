export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  role: UserRole;
  profile?: UserProfile;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface UserProfile {
  name: string;
  phone?: string;
  address?: Address;
  preferences?: UserPreferences;
  favoriteProducts?: string[];
  orderHistory?: string[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  label?: string; // 'Casa', 'Trabajo', etc.
}

export interface UserPreferences {
  notifications: NotificationSettings;
  dietary?: DietaryRestrictions;
  language: string;
  currency: string;
}

export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  reminders: boolean;
}

export interface DietaryRestrictions {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isLactoseFree?: boolean;
  allergies?: string[];
  other?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  photoUrl?: string;
  role?: UserRole; // Por defecto será USER
}

export interface UpdateUserRequest {
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  role?: UserRole;
  profile?: Partial<UserProfile>;
}