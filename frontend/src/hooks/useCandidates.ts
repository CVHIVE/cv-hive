import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { candidateService } from '../services/candidates';
import type { CandidateSearchFilters, UpdateCandidatePayload } from '../types';

export function useCandidateProfile() {
  return useQuery({
    queryKey: ['candidateProfile'],
    queryFn: () => candidateService.getProfile(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateCandidateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCandidatePayload) => candidateService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Update failed');
    },
  });
}

export function useUploadCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => candidateService.uploadCV(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      toast.success('CV uploaded');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Upload failed');
    },
  });
}

export function useRemoveCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => candidateService.removeCV(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      toast.success('CV removed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Remove failed');
    },
  });
}

export function useSearchCandidates(filters: CandidateSearchFilters) {
  return useQuery({
    queryKey: ['searchCandidates', filters],
    queryFn: () => candidateService.search(filters),
    staleTime: 30 * 1000,
  });
}

export function usePublicProfile(slug: string) {
  return useQuery({
    queryKey: ['publicProfile', slug],
    queryFn: () => candidateService.getPublicProfile(slug),
    enabled: !!slug,
  });
}
