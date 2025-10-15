import { z } from 'zod'

// Схемы валидации для форм
export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

export const profileSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Описание не должно превышать 500 символов').optional(),
})

export const productSchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов'),
  price: z.number().min(0, 'Цена не может быть отрицательной'),
  category: z.string().min(1, 'Выберите категорию'),
  images: z.array(z.string()).min(1, 'Добавьте хотя бы одно изображение'),
})

export const searchSchema = z.object({
  query: z.string().min(1, 'Введите поисковый запрос'),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum(['price', 'name', 'date', 'rating']).optional(),
})

export const contactSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  subject: z.string().min(5, 'Тема должна содержать минимум 5 символов'),
  message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов'),
})

// Типы для TypeScript
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type SearchFormData = z.infer<typeof searchSchema>
export type ContactFormData = z.infer<typeof contactSchema>

