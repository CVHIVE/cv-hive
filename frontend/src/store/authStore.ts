import { create } from 'zustand';
import type { Candidate, Employer, MeResponse, User } from '../types';

interface AuthState {
  user: User | null;
  candidate: Candidate | null;
  employer: Employer | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  setUser: (me: MeResponse) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  candidate: null,
  employer: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: true,

  setAuth: ({ user, accessToken, refreshToken }) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, isAuthenticated: true });
  },

  setUser: (me) => {
    set({
      user: { id: me.id, email: me.email, role: me.role, email_verified: me.email_verified },
      candidate: me.candidate ?? null,
      employer: me.employer ?? null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, candidate: null, employer: null, isAuthenticated: false, isLoading: false });
  },
}));
