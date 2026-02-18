import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/auth';
import { useAuthStore } from '../store/authStore';
import type { LoginPayload, RegisterPayload, RegisterEmployerPayload } from '../types';

export function useMe() {
  const { setUser, setLoading, logout } = useAuthStore();
  const hasToken = !!localStorage.getItem('accessToken');

  const query = useQuery({
    queryKey: ['me'],
    queryFn: () => authService.getMe(),
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!hasToken) {
      setLoading(false);
      return;
    }
    if (query.data) {
      setUser(query.data);
    }
    if (query.isError) {
      logout();
    }
    if (!query.isLoading) {
      setLoading(false);
    }
  }, [query.data, query.isError, query.isLoading, hasToken]);

  return query;
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Welcome back!');
      navigate(data.user.role === 'ADMIN' ? '/admin' : data.user.role === 'EMPLOYER' ? '/employer-dashboard' : '/dashboard');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Login failed');
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterPayload) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Account created!');
      // Don't navigate — Signup page handles multi-step flow
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Registration failed');
    },
  });
}

export function useRegisterEmployer() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterEmployerPayload) => authService.registerEmployer(data),
    onSuccess: (data) => {
      setAuth(data);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Employer account created!');
      navigate('/employer-dashboard');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Registration failed');
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    authService.logout().catch(() => {});
    logout();
    queryClient.clear();
    navigate('/');
    toast.success('Logged out');
  };
}
