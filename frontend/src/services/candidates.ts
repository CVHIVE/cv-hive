import api from './api';
import type {
  Candidate,
  CandidateSearchFilters,
  PaginatedCandidates,
  UpdateCandidatePayload,
} from '../types';

export const candidateService = {
  getProfile: () =>
    api.get<Candidate>('/candidates/profile').then((r) => r.data),

  updateProfile: (data: UpdateCandidatePayload) =>
    api.put<Candidate>('/candidates/profile', data).then((r) => r.data),

  uploadCV: (file: File) => {
    const formData = new FormData();
    formData.append('cv', file);
    return api
      .post<Candidate>('/candidates/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  search: (filters: CandidateSearchFilters) =>
    api.get<PaginatedCandidates>('/candidates', { params: filters }).then((r) => r.data),

  getPublicProfile: (slug: string) =>
    api.get<Candidate>(`/candidates/${slug}`).then((r) => r.data),
};
