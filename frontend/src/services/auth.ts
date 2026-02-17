import api from './api';
import type { AuthResponse, LoginPayload, MeResponse, RegisterPayload } from '../types';

export const authService = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  getMe: () =>
    api.get<MeResponse>('/auth/me').then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),
};
