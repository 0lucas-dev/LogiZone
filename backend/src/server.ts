import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import { errorHandler } from "./middleware/errorHandler.js";

import vagasRoutes from "./routes/vagas.js";
import veiculosRoutes from "./routes/veiculos.js";
import sessoesRoutes from "./routes/sessoes.js";
import infracoesRoutes from "./routes/infracoes.js";
import relatoriosRoutes from "./routes/relatorios.js";
import empresasRoutes from "./routes/empresas.js";
import motoristasRoutes from "./routes/motoristas.js";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rotas
app.use("/api/vagas", vagasRoutes);
app.use("/api/veiculos", veiculosRoutes);
app.use("/api/sessoes", sessoesRoutes);
app.use("/api/infracoes", infracoesRoutes);
app.use("/api/relatorios", relatoriosRoutes);
app.use("/api/empresas", empresasRoutes);
app.use("/api/motoristas", motoristasRoutes);

// Error handler global (deve ser o último middleware)
app.use(errorHandler);

// Job de expiração automática (verifica sessões a cada 60s)
const EXPIRATION_INTERVAL_MS = 60_000;

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
        const valorCobrado = tempoLimite * sessao.vaga.valorMinuto;

        await prisma.$transaction(async (tx) => {
          // Deduzir créditos do pagador
          if (sessao.pagadorTipo === "EMPRESA" && sessao.pagadorId) {
            await tx.empresa.update({
              where: { id: sessao.pagadorId },
              data: { creditos: { decrement: valorCobrado } }
            });
          } else if (sessao.pagadorId) {
            await tx.motorista.update({
              where: { id: sessao.pagadorId },
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

        console.log(`[Auto Check-out] Sessão ${sessao.id} — ${tempoLimite}min atingido — R$ ${valorCobrado.toFixed(2)}`);
      }
    }
  } catch (error) {
    console.error("[Job de Expiração] Erro:", error);
  }
}, EXPIRATION_INTERVAL_MS);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nEncerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nEncerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`═══════════════════════════════════`);
  console.log(`  LogiZone API — Porta ${PORT}`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`═══════════════════════════════════`);
});
