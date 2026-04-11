import { Gift } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type CreateAttendancePayload = {
  fullName: string;
  email: string;
  phone?: string;
  isAttending: boolean;
  companions?: number;
  message?: string;
};

const withCoupleSlug = (path: string, coupleSlug?: string) => {
  if (!coupleSlug) return `${API_URL}${path}`;

  const separator = path.includes('?') ? '&' : '?';
  return `${API_URL}${path}${separator}couple=${encodeURIComponent(coupleSlug)}`;
};

export const api = {
  async createAttendance(payload: CreateAttendancePayload) {
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Falha ao enviar confirmação de presença');
    }

    return response.json();
  },

  async getGifts(coupleSlug?: string): Promise<Gift[]> {
    const response = await fetch(withCoupleSlug('/gifts', coupleSlug), {
      method: 'GET',
    });

    if (!response.ok) throw new Error('Falha ao buscar presentes');
    return response.json();
  },

  async createGift(gift: Omit<Gift, 'id' | 'createdAt' | 'status'>, coupleSlug?: string): Promise<Gift> {
    try {
      const response = await fetch(withCoupleSlug('/gifts', coupleSlug), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(gift),
      });

      if (!response.ok) throw new Error('Falha ao criar presente');
      return response.json();
    } catch (error) {
      console.error('Erro ao criar presente:', error);
      throw error;
    }
  },


  async reserveGift(giftId: string, guestName: string, coupleSlug?: string): Promise<Gift> {
    const response = await fetch(withCoupleSlug(`/gifts/${giftId}/reserve`, coupleSlug), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reservedBy: guestName }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to reserve gift');
    }

    return response.json();
  },

  async updateGift(id: string, updates: Partial<Gift>, coupleSlug?: string): Promise<Gift> {
    try {
      const response = await fetch(withCoupleSlug(`/gifts/${id}`, coupleSlug), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Falha ao atualizar presente');
      return response.json();
    } catch (error) {
      console.error('Erro ao atualizar presente:', error);
      throw error;
    }
  },

  async deleteGift(id: string, coupleSlug?: string) {
    try {
      const response = await fetch(withCoupleSlug(`/gifts/${id}`, coupleSlug), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Falha ao deletar presente');
    } catch (error) {
      console.error('Erro ao deletar presente:', error);
      throw error;
    }
  },

  async login(username: string, password: string): Promise<{ accessToken: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error('Credenciais inválidas');
      return response.json();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  async getGiftsPagination(
    page: number = 1,
    limit: number = 12,
    filter: 'all' | 'available' | 'reserved' = 'all',
    search: string = '',
    coupleSlug?: string,
  ): Promise<{ data: Gift[]; meta: any }> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      filter,
      search,
    });

    if (coupleSlug) params.append('couple', coupleSlug);

    const response = await fetch(`${API_URL}/gifts?${params.toString()}`);
    if (!response.ok) throw new Error('Falha ao buscar presentes');
    return response.json();
  },
};
