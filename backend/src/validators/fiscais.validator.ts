import { z } from "zod";

export const fiscalLoginSchema = z.object({
  matricula: z.string().min(3)
});

export type FiscalLoginInput = z.infer<typeof fiscalLoginSchema>;
