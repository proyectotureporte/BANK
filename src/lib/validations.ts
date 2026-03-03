import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const transferSchema = z.object({
  toAccountNumber: z.string().min(1, "Número de cuenta requerido"),
  amount: z.number().positive("El monto debe ser positivo"),
  description: z.string().optional(),
  beneficiaryName: z.string().min(1, "Nombre del beneficiario requerido"),
  swiftCode: z.string().optional(),
  bankName: z.string().optional(),
  transferType: z.enum(["nacional", "internacional"]).optional(),
});

export const updateBalanceSchema = z.object({
  accountId: z.string(),
  newBalance: z.number().min(0, "El balance no puede ser negativo"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type UpdateBalanceInput = z.infer<typeof updateBalanceSchema>;
