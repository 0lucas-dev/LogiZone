import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/relatorios/resumo
router.get("/resumo", async (req: Request, res: Response) => {
  try {
    const totalVagas = await prisma.vaga.count({ where: { ativa: true } });
    
    const sessoesAtivas = await prisma.sessao.findMany({
      where: { status: { in: ["ATIVA", "EXPIRADA"] } }
    });

    const ocupadas = sessoesAtivas.filter(s => s.status === "ATIVA").length;
    const irregulares = sessoesAtivas.filter(s => s.status === "EXPIRADA").length;
    const livres = totalVagas - ocupadas - irregulares;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const totalSessoesHoje = await prisma.sessao.count({
      where: { iniciadaEm: { gte: hoje } }
    });

    const totalInfracoesHoje = await prisma.infracao.count({
      where: { registradaEm: { gte: hoje } }
    });

    const vagaMaisUsadaAgrupada = await prisma.sessao.groupBy({
      by: ['vagaId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1
    });

    let vagaMaisUsadaNome = null;
    if (vagaMaisUsadaAgrupada.length > 0) {
      const vaga = await prisma.vaga.findUnique({
        where: { id: vagaMaisUsadaAgrupada[0].vagaId }
      });
      if (vaga) vagaMaisUsadaNome = vaga.codigo;
    }

    res.json({
      sucesso: true,
      dados: {
        totalVagas,
        vagasLivres: livres,
        vagasOcupadas: ocupadas,
        vagasIrregulares: irregulares,
        totalSessoesHoje,
        totalInfracoesHoje,
        vagaMaisUsada: vagaMaisUsadaNome
      }
    });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: "Erro ao gerar resumo" });
  }
});

// GET /api/relatorios/mapa-calor
router.get("/mapa-calor", async (req: Request, res: Response) => {
  try {
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    const sessoes30Dias = await prisma.sessao.groupBy({
      by: ['vagaId'],
      _count: { id: true },
      where: { iniciadaEm: { gte: trintaDiasAtras } }
    });

    const vagasIds = sessoes30Dias.map(s => s.vagaId);

    const vagas = await prisma.vaga.findMany({
      where: { id: { in: vagasIds } }
    });

    const mapaCalor = vagas.map(vaga => {
      const count = sessoes30Dias.find(s => s.vagaId === vaga.id)?._count.id || 0;
      return {
        vagaId: vaga.id,
        codigo: vaga.codigo,
        lat: vaga.latitude,
        lng: vaga.longitude,
        totalSessoes30dias: count
      };
    });

    mapaCalor.sort((a, b) => b.totalSessoes30dias - a.totalSessoes30dias);

    res.json({ sucesso: true, dados: mapaCalor });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: "Erro ao gerar mapa de calor" });
  }
});

export default router;
