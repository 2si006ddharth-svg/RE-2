import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().positive('Price must be positive'),
  imageUrl: z.string().optional().default(''),
  stock: z.number().int().min(0).optional().default(100),
  category: z.string().min(1).max(100),
  active: z.boolean().optional().default(true),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Cart cannot be empty'),
});

export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'cancelled', 'refunded']),
});
