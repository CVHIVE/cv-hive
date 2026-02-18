import api from './api';

export interface JobAlert {
  id: string;
  candidate_id: string;
  title: string | null;
  industry: string | null;
  job_type: string | null;
  emirate: string | null;
  salary_min: number | null;
  frequency: string;
  is_active: boolean;
  created_at: string;
}

export const jobAlertService = {
  getAlerts: () =>
    api.get('/job-alerts').then((r) => r.data),

  createAlert: (data: Record<string, any>) =>
    api.post('/job-alerts', data).then((r) => r.data),

  updateAlert: (id: string, data: Record<string, any>) =>
    api.put(`/job-alerts/${id}`, data).then((r) => r.data),

  deleteAlert: (id: string) =>
    api.delete(`/job-alerts/${id}`).then((r) => r.data),
};
