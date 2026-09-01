import { create } from 'zustand';
import { UserDto } from '@foodlens/shared-types';

interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserDto, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('foodlens_user') || 'null'),
  accessToken: localStorage.getItem('foodlens_access_token'),
  refreshToken: localStorage.getItem('foodlens_refresh_token'),
  isAuthenticated: !!localStorage.getItem('foodlens_access_token'),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('foodlens_user', JSON.stringify(user));
    localStorage.setItem('foodlens_access_token', accessToken);
    localStorage.setItem('foodlens_refresh_token', refreshToken);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('foodlens_user');
    localStorage.removeItem('foodlens_access_token');
    localStorage.removeItem('foodlens_refresh_token');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));
