import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../server.js";
import { createVagaSchema, updateVagaSchema } from "../validators/vagas.validator.js";

const router = Router();

// GET /api/vagas - lista vagas com status
router.get("/", async (req: Request, res: Response) => {
  try {
    const vagas = await prisma.vaga.findMany({
      include: {
        sessoes: {
          where: {
            status: { in: ["ATIVA", "EXPIRADA"] }
          },
          include: {
            veiculo: true
          }
        }
      }
    });

    const vagasFormatadas = vagas.map(vaga => {
      const sessaoAtiva = vaga.sessoes.find(s => s.status === "ATIVA");
      const sessaoExpirada = vaga.sessoes.find(s => s.status === "EXPIRADA");
      
      let status = "LIVRE";
      let sessaoAtual = null;

      if (sessaoExpirada) {
        status = "IRREGULAR";
        const diffMs = new Date().getTime() - sessaoExpirada.iniciadaEm.getTime();
        sessaoAtual = {
          ...sessaoExpirada,
          minutosRestantes: vaga.limiteTempo - Math.floor(diffMs / 60000)
        };
      } else if (sessaoAtiva) {
        status = "OCUPADA";
        const diffMs = new Date().getTime() - sessaoAtiva.iniciadaEm.getTime();
        sessaoAtual = {
          ...sessaoAtiva,
          minutosRestantes: vaga.limiteTempo - Math.floor(diffMs / 60000)
        };
      }

      return {
        ...vaga,
        sessoes: undefined, // remove array puro
        status,
        sessaoAtual
      };
    });

    res.json({ sucesso: true, dados: vagasFormatadas });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: "Erro ao buscar vagas" });
  }
});

// GET /api/vagas/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ sucesso: false, erro: "ID inválido" });

    const vaga = await prisma.vaga.findUnique({
      where: { id },
      include: {
        sessoes: {
          where: { status: { in: ["ATIVA", "EXPIRADA"] } },
          include: { veiculo: true }
        }
      }
    });

    if (!vaga) return res.status(404).json({ sucesso: false, erro: "Vaga não encontrada" });

    const sessaoAtiva = vaga.sessoes.find(s => s.status === "ATIVA");
    const sessaoExpirada = vaga.sessoes.find(s => s.status === "EXPIRADA");
    let status = "LIVRE";
    let sessaoAtual = null;

    if (sessaoExpirada) {
      status = "IRREGULAR";
      const diffMs = new Date().getTime() - sessaoExpirada.iniciadaEm.getTime();
      sessaoAtual = {
        ...sessaoExpirada,
        minutosRestantes: vaga.limiteTempo - Math.floor(diffMs / 60000)
      };
    } else if (sessaoAtiva) {
      status = "OCUPADA";
      const diffMs = new Date().getTime() - sessaoAtiva.iniciadaEm.getTime();
      sessaoAtual = {
        ...sessaoAtiva,
        minutosRestantes: vaga.limiteTempo - Math.floor(diffMs / 60000)
      };
    }

    res.json({
      sucesso: true,
      dados: { ...vaga, sessoes: undefined, status, sessaoAtual }
    });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: "Erro ao buscar vaga" });
  }
});

// POST /api/vagas
router.post("/", async (req: Request, res: Response) => {
  try {
    const data = createVagaSchema.parse(req.body);
    const vaga = await prisma.vaga.create({ data });
    res.json({ sucesso: true, dados: vaga });
  } catch (error) {
    res.status(400).json({ sucesso: false, erro: "Dados inválidos" });
  }
});

// PATCH /api/vagas/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ sucesso: false, erro: "ID inválido" });
    const data = updateVagaSchema.parse(req.body);
    const vaga = await prisma.vaga.update({ where: { id }, data });
    res.json({ sucesso: true, dados: vaga });
  } catch (error) {
    res.status(400).json({ sucesso: false, erro: "Dados inválidos" });
  }
});

export default router;
