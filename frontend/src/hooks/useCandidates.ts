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

// ── Bookmarking hooks ──────────────────────────────────

export function useBookmarkIds() {
  return useQuery({
    queryKey: ['bookmarkIds'],
    queryFn: () => candidateService.getBookmarkIds(),
    staleTime: 60 * 1000,
  });
}

export function useBookmarkedCandidates(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['bookmarkedCandidates', page, limit],
    queryFn: () => candidateService.getBookmarkedCandidates(page, limit),
    staleTime: 30 * 1000,
  });
}

export function useBookmarkCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (candidateId: string) => candidateService.bookmarkCandidate(candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarkIds'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarkedCandidates'] });
      toast.success('Candidate bookmarked');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to bookmark');
    },
  });
}

export function useUnbookmarkCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (candidateId: string) => candidateService.unbookmarkCandidate(candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarkIds'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarkedCandidates'] });
      toast.success('Bookmark removed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove bookmark');
    },
  });
}
