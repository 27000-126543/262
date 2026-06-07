
import { create } from 'zustand';
import { User } from '@/types';
import { getUser, setUser as setUserStorage, clearStorage } from '@/utils/storage';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  initUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user: User) => {
    setUserStorage(user);
    set({ user, isAuthenticated: true });
  },

  clearUser: () => {
    clearStorage();
    set({ user: null, isAuthenticated: false });
  },

  initUser: () => {
    const savedUser = getUser<User>();
    if (savedUser) {
      set({ user: savedUser, isAuthenticated: true });
    }
  },
}));
