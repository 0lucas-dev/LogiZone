import { z } from "zod";

export const checkinSchema = z.object({
  vagaId: z.number().int().positive(),
  veiculoId: z.number().int().positive(),
  motoristaId: z.number().int().positive(),
  pagadorTipo: z.enum(["MOTORISTA", "EMPRESA"]),
  pagadorId: z.number().int().positive()
});

export type CheckinInput = z.infer<typeof checkinSchema>;

export const checkoutSchema = z.object({
  sessaoId: z.number().int().positive()
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
