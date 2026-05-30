import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../server.js";
import { createVeiculoSchema } from "../validators/veiculos.validator.js";

const router = Router();

// POST /api/veiculos
router.post("/", async (req: Request, res: Response) => {
  try {
    const data = createVeiculoSchema.parse(req.body);
    
    // Verifica se já existe a placa
    const existe = await prisma.veiculo.findUnique({ where: { placa: data.placa } });
    if (existe) {
      return res.status(409).json({ sucesso: false, erro: "Veículo já cadastrado" });
    }

    const veiculo = await prisma.veiculo.create({ data });
    res.json({ sucesso: true, dados: veiculo });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ sucesso: false, erro: error.errors || "Dados inválidos" });
  }
});

// GET /api/veiculos/:placa
router.get("/:placa", async (req: Request, res: Response) => {
  try {
    const veiculo = await prisma.veiculo.findUnique({
      where: { placa: req.params.placa },
      include: {
        sessoes: {
          orderBy: { iniciadaEm: 'desc' },
          include: { vaga: true }
        }
      }
    });

    if (!veiculo) return res.status(404).json({ sucesso: false, erro: "Veículo não encontrado" });
    
    res.json({ sucesso: true, dados: veiculo });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: "Erro ao buscar veículo" });
  }
});

// POST /api/veiculos/:id/atribuir
router.post("/:id/atribuir", async (req: Request, res: Response) => {
  try {
    const veiculoId = parseInt(req.params.id);
    const { motoristaId } = req.body;

    if (!motoristaId) return res.status(400).json({ erro: "Motorista ID é obrigatório" });

    const atribuicao = await prisma.atribuicaoVeiculo.upsert({
      where: { veiculoId_motoristaId: { veiculoId, motoristaId } },
      update: {},
      create: { veiculoId, motoristaId }
    });

    res.json({ sucesso: true, atribuicao });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atribuir veículo" });
  }
});

// POST /api/veiculos/:id/desatribuir
router.post("/:id/desatribuir", async (req: Request, res: Response) => {
  try {
    const veiculoId = parseInt(req.params.id);
    const { motoristaId } = req.body;

    await prisma.atribuicaoVeiculo.delete({
      where: { veiculoId_motoristaId: { veiculoId, motoristaId } }
    });

    res.json({ sucesso: true });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao desatribuir veículo" });
  }
});

export default router;
