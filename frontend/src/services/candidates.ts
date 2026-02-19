import api from './api';
import type {
  Candidate,
  CandidateSearchFilters,
  PaginatedCandidates,
  RevealedContact,
  UpdateCandidatePayload,
  BookmarkedCandidate,
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

  removeCV: () =>
    api.delete<Candidate>('/candidates/cv').then((r) => r.data),

  search: (filters: CandidateSearchFilters) =>
    api.get<PaginatedCandidates>('/candidates', { params: filters }).then((r) => r.data),

  getPublicProfile: (slug: string) =>
    api.get<Candidate>(`/candidates/${slug}`).then((r) => r.data),

  revealContact: (candidateId: string) =>
    api.post<RevealedContact>(`/candidates/${candidateId}/reveal`).then((r) => r.data),

  // Bookmarking (Professional+)
  bookmarkCandidate: (candidateId: string) =>
    api.post(`/candidates/${candidateId}/bookmark`).then((r) => r.data),

  unbookmarkCandidate: (candidateId: string) =>
    api.delete(`/candidates/${candidateId}/bookmark`).then((r) => r.data),

  getBookmarkedCandidates: (page = 1, limit = 20) =>
    api.get<{ candidates: BookmarkedCandidate[]; pagination: any }>('/candidates/bookmarks', { params: { page, limit } }).then((r) => r.data),

  getBookmarkIds: () =>
    api.get<string[]>('/candidates/bookmark-ids').then((r) => r.data),

  // Bulk export (Enterprise)
  exportCandidatesCSV: (filters: CandidateSearchFilters) =>
    api.get('/candidates/export', { params: filters, responseType: 'blob' }).then((r) => r.data),
};
