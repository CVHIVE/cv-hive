import api from './api';
import type { CreateJobPayload, JobSearchFilters } from '../types';

export const jobService = {
  searchJobs: (filters: JobSearchFilters) =>
    api.get('/jobs/search', { params: filters }).then((r) => r.data),

  getRecentJobs: () =>
    api.get('/jobs/recent').then((r) => r.data),

  getPlatformStats: () =>
    api.get('/jobs/stats').then((r) => r.data),

  getSalaryGuide: () =>
    api.get('/jobs/salary-guide').then((r) => r.data),

  getFeaturedEmployers: () =>
    api.get('/jobs/featured-employers').then((r) => r.data),

  getJob: (id: string) =>
    api.get(`/jobs/${id}`).then((r) => r.data),

  createJob: (data: CreateJobPayload) =>
    api.post('/jobs', data).then((r) => r.data),

  updateJob: (id: string, data: Partial<CreateJobPayload>) =>
    api.put(`/jobs/${id}`, data).then((r) => r.data),

  closeJob: (id: string) =>
    api.put(`/jobs/${id}/close`).then((r) => r.data),

  getEmployerJobs: () =>
    api.get('/jobs/employer/mine').then((r) => r.data),

  applyToJob: (id: string, coverLetter?: string) =>
    api.post(`/jobs/${id}/apply`, { coverLetter }).then((r) => r.data),

  getApplicationsForJob: (id: string) =>
    api.get(`/jobs/${id}/applications`).then((r) => r.data),

  getCandidateApplications: () =>
    api.get('/jobs/applications/mine').then((r) => r.data),

  saveJob: (id: string) =>
    api.post(`/jobs/${id}/save`).then((r) => r.data),

  unsaveJob: (id: string) =>
    api.delete(`/jobs/${id}/save`).then((r) => r.data),

  getSavedJobs: () =>
    api.get('/jobs/saved/mine').then((r) => r.data),

  withdrawApplication: (applicationId: string) =>
    api.put(`/jobs/applications/${applicationId}/withdraw`).then((r) => r.data),

  updateApplicationStatus: (applicationId: string, status: string, notes?: string) =>
    api.put(`/jobs/applications/${applicationId}/status`, { status, notes }).then((r) => r.data),

  getApplicationStatusHistory: (applicationId: string) =>
    api.get(`/jobs/applications/${applicationId}/history`).then((r) => r.data),

  payForJob: (id: string) =>
    api.post(`/jobs/${id}/pay`).then((r) => r.data),

  repostJob: (id: string) =>
    api.post(`/jobs/${id}/repost`).then((r) => r.data),

  verifyJobPayment: (sessionId: string) =>
    api.post('/jobs/verify-payment', { sessionId }).then((r) => r.data),

  // Saved searches
  saveSearch: (name: string, filters: any) =>
    api.post('/jobs/searches/save', { name, filters }).then((r) => r.data),

  getSavedSearches: () =>
    api.get('/jobs/searches/mine').then((r) => r.data),

  deleteSavedSearch: (searchId: string) =>
    api.delete(`/jobs/searches/${searchId}`).then((r) => r.data),
};
