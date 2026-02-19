import api from './api';

export const adminService = {
  getStats: () =>
    api.get('/admin/stats').then((r) => r.data),

  getActivity: () =>
    api.get('/admin/activity').then((r) => r.data),

  getUsers: () =>
    api.get('/admin/users').then((r) => r.data),

  getCandidates: () =>
    api.get('/admin/candidates').then((r) => r.data),

  getEmployers: () =>
    api.get('/admin/employers').then((r) => r.data),

  deleteUser: (userId: string) =>
    api.delete(`/admin/users/${userId}`).then((r) => r.data),

  getJobs: () =>
    api.get('/admin/jobs').then((r) => r.data),

  updateJobStatus: (jobId: string, status: string) =>
    api.put(`/admin/jobs/${jobId}/status`, { status }).then((r) => r.data),

  updateEmployerSubscription: (employerId: string, planType: string) =>
    api.put(`/admin/employers/${employerId}/subscription`, { planType }).then((r) => r.data),
};
