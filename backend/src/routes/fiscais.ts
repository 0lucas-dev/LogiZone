import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../server.js";
import { fiscalLoginSchema } from "../validators/fiscais.validator.js";

const router = Router();

// POST /api/fiscais/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const data = fiscalLoginSchema.parse(req.body);
    
    const fiscal = await prisma.fiscal.findUnique({ where: { matricula: data.matricula } });
    if (!fiscal) return res.status(404).json({ sucesso: false, erro: "Fiscal não encontrado" });

    res.json({ sucesso: true, dados: fiscal });
  } catch (error: any) {
    res.status(400).json({ sucesso: false, erro: error.errors || "Dados inválidos" });
  }
});

// GET /api/fiscais
router.get("/", async (req: Request, res: Response) => {
  try {
    const fiscais = await prisma.fiscal.findMany();
    res.json({ sucesso: true, dados: fiscais });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: "Erro ao listar fiscais" });
  }
});

export default router;
