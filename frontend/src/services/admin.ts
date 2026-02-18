import api from './api';

export const adminService = {
  getUsers: () =>
    api.get('/admin/users').then((r) => r.data),

  getCandidates: () =>
    api.get('/admin/candidates').then((r) => r.data),

  getEmployers: () =>
    api.get('/admin/employers').then((r) => r.data),

  resetPassword: (userId: string, newPassword: string) =>
    api.put(`/admin/users/${userId}/reset-password`, { newPassword }).then((r) => r.data),

  deleteUser: (userId: string) =>
    api.delete(`/admin/users/${userId}`).then((r) => r.data),

  getJobs: () =>
    api.get('/admin/jobs').then((r) => r.data),
};
