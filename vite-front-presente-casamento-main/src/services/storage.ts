import { Gift } from '../types';

const GIFTS_KEY = 'wedding_gifts';
const USER_KEY = 'wedding_user';

export const getGifts = (): Gift[] => {
  try {
    const gifts = localStorage.getItem(GIFTS_KEY);
    return gifts ? JSON.parse(gifts) : [];
  } catch (error) {
    console.error('Error getting gifts from localStorage:', error);
    return [];
  }
};

export const saveGifts = (gifts: Gift[]): void => {
  try {
    localStorage.setItem(GIFTS_KEY, JSON.stringify(gifts));
  } catch (error) {
    console.error('Error saving gifts to localStorage:', error);
  }
};

export const getUser = (): { isAdmin: boolean } => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : { isAdmin: false };
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return { isAdmin: false };
  }
};

export const saveUser = (user: { isAdmin: boolean }): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};