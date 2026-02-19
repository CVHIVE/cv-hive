import { z } from 'zod';

// Personal / free email domains that employers cannot use
const BLOCKED_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'outlook.co.uk',
  'live.com', 'live.co.uk', 'msn.com', 'aol.com', 'icloud.com',
  'me.com', 'mac.com', 'mail.com', 'protonmail.com', 'proton.me',
  'zoho.com', 'yandex.com', 'yandex.ru', 'gmx.com', 'gmx.net',
  'inbox.com', 'fastmail.com', 'tutanota.com', 'hushmail.com',
  'rediffmail.com', 'qq.com', '163.com', '126.com',
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
];

export function isBusinessEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return !BLOCKED_EMAIL_DOMAINS.includes(domain);
}

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().optional(),
});

export const registerEmployerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().min(1, 'Company name is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
