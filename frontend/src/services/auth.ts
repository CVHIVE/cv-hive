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

  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }).then((r) => r.data),

  resendVerification: () =>
    api.post('/auth/resend-verification').then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).then((r) => r.data),
};
