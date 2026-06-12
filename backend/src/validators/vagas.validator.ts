import { z } from "zod";

export const createVagaSchema = z.object({
  codigo: z.string().min(3),
  logradouro: z.string().min(3),
  numero: z.string(),
  bairro: z.string().min(3),
  cidade: z.string().min(3),
  latitude: z.number(),
  longitude: z.number(),
  tamanho: z.string().optional(),
  horariosDisponiveis: z.string().optional(),
  tiposVeiculos: z.string().optional(),
  valorMinuto: z.number().positive().optional(),
  limiteTempo: z.number().int().positive().optional()
});

export type CreateVagaInput = z.infer<typeof createVagaSchema>;

export const updateVagaSchema = createVagaSchema.partial();
export type UpdateVagaInput = z.infer<typeof updateVagaSchema>;
