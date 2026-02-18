import api from './api';

export const subscriptionService = {
  createCheckout: (planType: string) =>
    api.post('/subscriptions/checkout', { planType }).then((r) => r.data),

  getStatus: () =>
    api.get('/subscriptions/status').then((r) => r.data),

  cancel: () =>
    api.post('/subscriptions/cancel').then((r) => r.data),
};
