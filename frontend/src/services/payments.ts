import api from './api';

export interface PaymentMethod {
  id: string;
  card_brand: string;
  card_last4: string;
  card_exp_month: number;
  card_exp_year: number;
  cardholder_name: string;
  is_default: boolean;
  created_at: string;
}

export const paymentService = {
  getAll: () =>
    api.get<PaymentMethod[]>('/payment-methods').then((r) => r.data),

  add: (data: { cardNumber: string; expMonth: number; expYear: number; cardholderName: string }) =>
    api.post<PaymentMethod>('/payment-methods', data).then((r) => r.data),

  setDefault: (id: string) =>
    api.put(`/payment-methods/${id}/default`).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/payment-methods/${id}`).then((r) => r.data),
};
