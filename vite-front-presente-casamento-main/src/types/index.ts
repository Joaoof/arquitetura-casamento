export interface Gift {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  reservedBy?: string;
  price?: number;
  status: 'available' | 'reserved';
  priority?: 'high' | 'medium' | 'low';
  createdAt: number;
}

export interface User {
  isAdmin: boolean;
}

export interface GiftRegistration {
  id: string;
  guestName: string;
  guestEmail: string;
  giftId: string;
  createdAt: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}