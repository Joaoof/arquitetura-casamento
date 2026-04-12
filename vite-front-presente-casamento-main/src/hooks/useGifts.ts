import { useState, useEffect } from 'react';
import { Gift } from '../types';
import { api } from '../services/api';

export const useGifts = (coupleSlug?: string) => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'reserved'>('all');

  const fetchGifts = async () => {
    try {
      const data = await api.getGifts(coupleSlug);
      setGifts(data);
    } catch (error) {
      console.error('Error fetching gifts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, [coupleSlug]);

  const addGift = async (gift: Omit<Gift, 'id' | 'createdAt' | 'status'>) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gifts${coupleSlug ? `?couple=${encodeURIComponent(coupleSlug)}` : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(gift),
      });

      if (!response.ok) throw new Error('Failed to add gift');

      const newGift = await response.json();
      setGifts(prev => [...prev, newGift]);
    } catch (error) {
      console.error('Error adding gift:', error);
      throw error;
    }
  };

  const updateGift = async (id: string, updates: Partial<Gift>) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gifts/${id}${coupleSlug ? `?couple=${encodeURIComponent(coupleSlug)}` : ''}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update gift');

      const updatedGift = await response.json();
      setGifts(prev => prev.map(gift => gift.id === id ? updatedGift : gift));
    } catch (error) {
      console.error('Error updating gift:', error);
      throw error;
    }
  };

  const removeGift = async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gifts/${id}${coupleSlug ? `?couple=${encodeURIComponent(coupleSlug)}` : ''}`, {
        method: 'DELETE',

        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete gift');

      setGifts(prev => prev.filter(gift => gift.id !== id));
    } catch (error) {
      console.error('Error removing gift:', error);
      throw error;
    }
  };

  const removeAllGifts = async () => {
    try {
      await api.deleteAllGifts();
      setGifts([]);
    } catch (error) {
      console.error('Error removing all gifts:', error);
      throw error;
    }
  };

  const reserveGift = async (id: string, reservedBy: string) => {
    try {
      const updatedGift = await api.reserveGift(id, reservedBy, coupleSlug);
      setGifts(prev => prev.map(gift => gift.id === id ? updatedGift : gift));
      return updatedGift;
    } catch (error) {
      console.error('Error reserving gift:', error);
      throw error;
    }
  };

  const filteredGifts = gifts
    .filter((gift) => {
      if (filter === 'available') return gift.status === 'available';
      if (filter === 'reserved') return gift.status === 'reserved';
      return true;
    })
    .filter((gift) =>
      gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gift.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    gifts: filteredGifts,
    isLoading,
    addGift,
    updateGift,
    removeGift,
    removeAllGifts,
    reserveGift,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
  };
};
