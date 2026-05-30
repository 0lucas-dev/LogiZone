import type { Vaga, Veiculo, Sessao, Fiscal, Infracao } from "@prisma/client";
import type { z } from "zod";
import { checkinSchema, checkoutSchema } from "../validators/sessoes.validator.js";
import { createVeiculoSchema } from "../validators/veiculos.validator.js";
import { createVagaSchema, updateVagaSchema } from "../validators/vagas.validator.js";
import { fiscalLoginSchema } from "../validators/fiscais.validator.js";
import { createInfracaoSchema } from "../validators/infracoes.validator.js";

export type CheckinInput = z.infer<typeof checkinSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CreateVeiculoInput = z.infer<typeof createVeiculoSchema>;
export type CreateVagaInput = z.infer<typeof createVagaSchema>;
export type UpdateVagaInput = z.infer<typeof updateVagaSchema>;
export type FiscalLoginInput = z.infer<typeof fiscalLoginSchema>;
export type CreateInfracaoInput = z.infer<typeof createInfracaoSchema>;

export type { Vaga, Veiculo, Sessao, Fiscal, Infracao };

export type ApiResponse<T> =
  | { sucesso: true; dados: T }
  | { sucesso: false; erro: string };
