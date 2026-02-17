import api from './api';
import type { Employer, UpdateEmployerPayload } from '../types';

export const employerService = {
  getProfile: () =>
    api.get<Employer>('/employers/profile').then((r) => r.data),

  updateProfile: (data: UpdateEmployerPayload) =>
    api.put<Employer>('/employers/profile', data).then((r) => r.data),
};
