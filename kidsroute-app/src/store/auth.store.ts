import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  accessToken: string | null;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setToken: async (token) => {
    await AsyncStorage.setItem('accessToken', token);
    set({ accessToken: token });
  },
  clearToken: async () => {
    await AsyncStorage.removeItem('accessToken');
    set({ accessToken: null });
  },
}));
