import db from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

interface AddCardData {
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cardholderName: string;
}

function detectCardBrand(number: string): string {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^6(?:011|5)/.test(n)) return 'Discover';
  return 'Card';
}

export const addPaymentMethod = async (employerId: string, data: AddCardData) => {
  const cardNumber = data.cardNumber.replace(/\s/g, '');
  if (cardNumber.length < 13 || cardNumber.length > 19) {
    throw new Error('Invalid card number');
  }
  if (data.expMonth < 1 || data.expMonth > 12) {
    throw new Error('Invalid expiration month');
  }
  const now = new Date();
  const expDate = new Date(data.expYear, data.expMonth - 1);
  if (expDate < now) {
    throw new Error('Card has expired');
  }
  if (!data.cardholderName || data.cardholderName.trim().length < 2) {
    throw new Error('Cardholder name is required');
  }

  const brand = detectCardBrand(cardNumber);
  const last4 = cardNumber.slice(-4);

  // Check if any cards exist — first card becomes default
  const existing = await db.query(
    'SELECT id FROM payment_methods WHERE employer_id = $1',
    [employerId]
  );
  const isDefault = existing.rows.length === 0;

  const id = uuidv4();
  const result = await db.query(
    `INSERT INTO payment_methods (id, employer_id, card_brand, card_last4, card_exp_month, card_exp_year, cardholder_name, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [id, employerId, brand, last4, data.expMonth, data.expYear, data.cardholderName.trim(), isDefault]
  );
  return result.rows[0];
};

export const getPaymentMethods = async (employerId: string) => {
  const result = await db.query(
    'SELECT * FROM payment_methods WHERE employer_id = $1 ORDER BY is_default DESC, created_at DESC',
    [employerId]
  );
  return result.rows;
};

export const setDefaultPaymentMethod = async (employerId: string, paymentMethodId: string) => {
  // Verify ownership
  const pm = await db.query(
    'SELECT id FROM payment_methods WHERE id = $1 AND employer_id = $2',
    [paymentMethodId, employerId]
  );
  if (pm.rows.length === 0) throw new Error('Payment method not found');

  // Unset all defaults
  await db.query(
    'UPDATE payment_methods SET is_default = FALSE WHERE employer_id = $1',
    [employerId]
  );
  // Set new default
  await db.query(
    'UPDATE payment_methods SET is_default = TRUE WHERE id = $1',
    [paymentMethodId]
  );
  return { message: 'Default payment method updated' };
};

export const deletePaymentMethod = async (employerId: string, paymentMethodId: string) => {
  const pm = await db.query(
    'SELECT id, is_default FROM payment_methods WHERE id = $1 AND employer_id = $2',
    [paymentMethodId, employerId]
  );
  if (pm.rows.length === 0) throw new Error('Payment method not found');

  await db.query('DELETE FROM payment_methods WHERE id = $1', [paymentMethodId]);

  // If deleted card was default, make the next one default
  if (pm.rows[0].is_default) {
    await db.query(
      `UPDATE payment_methods SET is_default = TRUE
       WHERE id = (SELECT id FROM payment_methods WHERE employer_id = $1 ORDER BY created_at ASC LIMIT 1)`,
      [employerId]
    );
  }
  return { message: 'Payment method removed' };
};

export const getDefaultPaymentMethod = async (employerId: string) => {
  const result = await db.query(
    'SELECT * FROM payment_methods WHERE employer_id = $1 AND is_default = TRUE LIMIT 1',
    [employerId]
  );
  return result.rows[0] || null;
};
