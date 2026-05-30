import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

import vagasRoutes from "./routes/vagas.js";
import veiculosRoutes from "./routes/veiculos.js";
import sessoesRoutes from "./routes/sessoes.js";
import fiscaisRoutes from "./routes/fiscais.js";
import infracoesRoutes from "./routes/infracoes.js";
import relatoriosRoutes from "./routes/relatorios.js";
import empresasRoutes from "./routes/empresas.js";
import motoristasRoutes from "./routes/motoristas.js";

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Repassa a instância do Prisma via req para as rotas, mas vamos exportar pra usar direto
export { prisma };

// Rotas
app.use("/api/vagas", vagasRoutes);
app.use("/api/veiculos", veiculosRoutes);
app.use("/api/sessoes", sessoesRoutes);
app.use("/api/fiscais", fiscaisRoutes);
app.use("/api/infracoes", infracoesRoutes);
app.use("/api/relatorios", relatoriosRoutes);
app.use("/api/empresas", empresasRoutes);
app.use("/api/motoristas", motoristasRoutes);

// Job de expiração
setInterval(async () => {
  try {
    const sessoesAtivas = await prisma.sessao.findMany({
      where: { status: "ATIVA" },
      include: { vaga: true }
    });

    const now = new Date();

    for (const sessao of sessoesAtivas) {
      const diffMs = now.getTime() - sessao.iniciadaEm.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      
      const tempoLimite = sessao.vaga.limiteTempo;

      if (diffMinutes >= tempoLimite) {
        // Auto check-out
        const valorCobrado = tempoLimite * sessao.vaga.valorMinuto;

        await prisma.$transaction(async (tx) => {
          if (sessao.pagadorTipo === "EMPRESA") {
            await tx.empresa.update({
              where: { id: sessao.pagadorId! },
              data: { creditos: { decrement: valorCobrado } }
            });
          } else {
            await tx.motorista.update({
              where: { id: sessao.pagadorId! },
              data: { creditos: { decrement: valorCobrado } }
            });
          }

          await tx.sessao.update({
            where: { id: sessao.id },
            data: { 
              status: "ENCERRADA", 
              encerradaEm: now,
              valorCobrado 
            }
          });
        });

        console.log(`Auto Check-out da Sessão ${sessao.id} (limite de ${tempoLimite}m atingido. Cobrado: R$ ${valorCobrado})`);
      }
    }
  } catch (error) {
    console.error("Erro no job de expiração:", error);
  }
}, 60000);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
