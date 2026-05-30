import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../server.js";
import { createInfracaoSchema } from "../validators/infracoes.validator.js";

const router = Router();

// POST /api/infracoes
router.post("/", async (req: Request, res: Response) => {
  try {
    const data = createInfracaoSchema.parse(req.body);
    
    let veiculoId = null;

    if (data.placaAvulsa) {
      const veiculo = await prisma.veiculo.findUnique({ where: { placa: data.placaAvulsa } });
      if (veiculo) veiculoId = veiculo.id;
    }

    const infracao = await prisma.infracao.create({
      data: {
        vagaId: data.vagaId,
        fiscalId: data.fiscalId,
        motivo: data.motivo,
        observacao: data.observacao,
        placaAvulsa: data.placaAvulsa,
        veiculoId: veiculoId
      }
    });

    res.json({ sucesso: true, dados: infracao });
  } catch (error: any) {
    res.status(400).json({ sucesso: false, erro: error.errors || "Dados inválidos" });
  }
});

// GET /api/infracoes
router.get("/", async (req: Request, res: Response) => {
  try {
    const { vagaId, fiscalId } = req.query;
    const where: any = {};

    if (vagaId) where.vagaId = parseInt(vagaId as string);
    if (fiscalId) where.fiscalId = parseInt(fiscalId as string);

    const infracoes = await prisma.infracao.findMany({
      where,
      include: {
        vaga: true,
        fiscal: true,
        veiculo: true
      },
      orderBy: {
        registradaEm: 'desc'
      }
    });

    res.json({ sucesso: true, dados: infracoes });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: "Erro ao listar infrações" });
  }
});

export default router;
