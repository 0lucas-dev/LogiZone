import { z } from "zod";

export const createInfracaoSchema = z.object({
  vagaId: z.number().int().positive(),
  motivo: z.enum(["SEM_CHECKIN", "TEMPO_EXPIRADO", "VEICULO_NAO_AUTORIZADO"]),
  placaAvulsa: z.string().optional(),
  observacao: z.string().optional()
});

export type CreateInfracaoInput = z.infer<typeof createInfracaoSchema>;
