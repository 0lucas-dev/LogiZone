import { z } from "zod";

export const createVeiculoSchema = z.object({
  placa: z.string().min(7).max(8),
  renavam: z.string().min(3),
  empresaId: z.number().optional(),
  motoristaId: z.number().optional(),
  tipo: z.string()
});

export type CreateVeiculoInput = z.infer<typeof createVeiculoSchema>;
