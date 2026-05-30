import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../server.js";
import { checkinSchema, checkoutSchema } from "../validators/sessoes.validator.js";

const router = Router();

// POST /api/sessoes/checkin
router.post("/checkin", async (req: Request, res: Response) => {
  try {
    const data = checkinSchema.parse(req.body);

    const motorista = await prisma.motorista.findUnique({ where: { id: data.motoristaId } });
    if (!motorista) return res.status(404).json({ sucesso: false, erro: "Motorista não encontrado" });

    const veiculo = await prisma.veiculo.findUnique({ where: { id: data.veiculoId } });
    if (!veiculo) return res.status(404).json({ sucesso: false, erro: "Veículo não encontrado" });

    const vaga = await prisma.vaga.findUnique({ where: { id: data.vagaId } });
    if (!vaga || !vaga.ativa) return res.status(404).json({ sucesso: false, erro: "Vaga não encontrada ou inativa" });

    // Trava de Compatibilidade (Tamanho)
    const TIPO_HIERARQUIA: Record<string, number> = {
      "UTILITARIO": 1,
      "VAN": 2,
      "CAMINHAO": 3
    };

    if (vaga.tamanho) {
      const pesoVaga = TIPO_HIERARQUIA[vaga.tamanho] || 99;
      const pesoVeiculo = TIPO_HIERARQUIA[veiculo.tipo] || 0;

      if (pesoVeiculo > pesoVaga) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: `Erro: O tamanho do seu veículo (${veiculo.tipo}) excede o limite permitido para esta vaga (${vaga.tamanho}).` 
        });
      }
    }

    const sessaoExistente = await prisma.sessao.findFirst({
      where: {
        vagaId: data.vagaId,
        status: { in: ["ATIVA", "EXPIRADA"] }
      }
    });

    if (sessaoExistente) return res.status(409).json({ sucesso: false, erro: "Vaga já ocupada" });

    const sessaoVeiculo = await prisma.sessao.findFirst({
      where: {
        veiculoId: veiculo.id,
        status: { in: ["ATIVA", "EXPIRADA"] }
      }
    });

    if (sessaoVeiculo) return res.status(409).json({ sucesso: false, erro: "Veículo já possui check-in ativo" });

    // Verificar se a carteira do pagador tem pelo menos 0 de saldo (para não permitir quem já está negativo)
    let saldoAtual = 0;
    if (data.pagadorTipo === "EMPRESA") {
      const empresa = await prisma.empresa.findUnique({ where: { id: data.pagadorId } });
      if (!empresa) return res.status(404).json({ sucesso: false, erro: "Empresa pagadora não encontrada" });
      saldoAtual = empresa.creditos;
    } else {
      if (data.pagadorId !== motorista.id) return res.status(403).json({ sucesso: false, erro: "Pagador não é o motorista" });
      saldoAtual = motorista.creditos;
    }

    if (saldoAtual < 0) {
      return res.status(400).json({ sucesso: false, erro: "Saldo negativo. Regularize sua carteira." });
    }

    // Apenas cria a sessão (Pay-per-use)
    const sessao = await prisma.sessao.create({
      data: {
        vagaId: vaga.id,
        veiculoId: veiculo.id,
        motoristaId: motorista.id,
        pagadorTipo: data.pagadorTipo,
        pagadorId: data.pagadorId,
        status: "ATIVA"
      }
    });

    res.json({ sucesso: true, dados: sessao });
  } catch (error: any) {
    res.status(400).json({ sucesso: false, erro: error.errors || error.message || "Erro no check-in" });
  }
});

// POST /api/sessoes/checkout
router.post("/checkout", async (req: Request, res: Response) => {
  try {
    const data = checkoutSchema.parse(req.body);

    const sessao = await prisma.sessao.findUnique({ 
      where: { id: data.sessaoId },
      include: { vaga: true }
    });
    if (!sessao) return res.status(404).json({ sucesso: false, erro: "Sessão não encontrada" });
    if (sessao.status === "ENCERRADA") return res.status(400).json({ sucesso: false, erro: "Sessão já encerrada" });

    const agora = new Date();
    const diffMs = agora.getTime() - sessao.iniciadaEm.getTime();
    let minutosUsados = Math.ceil(diffMs / 60000);

    // Se passou do limite, cobra o limite
    if (minutosUsados > sessao.vaga.limiteTempo) {
      minutosUsados = sessao.vaga.limiteTempo;
    }
    
    // Pelo menos 1 minuto de cobrança
    if (minutosUsados === 0) minutosUsados = 1;

    const valorCobrado = minutosUsados * sessao.vaga.valorMinuto;

    // Transação: Deduzir créditos e encerrar sessão
    let sessaoAtualizada;
    await prisma.$transaction(async (tx) => {
      // Deduzir da carteira correta
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

      sessaoAtualizada = await tx.sessao.update({
        where: { id: sessao.id },
        data: {
          status: "ENCERRADA",
          encerradaEm: agora,
          valorCobrado
        }
      });
    });

    res.json({ sucesso: true, dados: sessaoAtualizada });
  } catch (error: any) {
    res.status(400).json({ sucesso: false, erro: error.errors || "Erro no check-out" });
  }
});

// GET /api/sessoes/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ sucesso: false, erro: "ID inválido" });

    const sessao = await prisma.sessao.findUnique({
      where: { id },
      include: { vaga: true, veiculo: true }
    });

    if (!sessao) return res.status(404).json({ sucesso: false, erro: "Sessão não encontrada" });

    let minutosRestantes = 0;
    let valorAtual = 0;
    if (sessao.status !== "ENCERRADA") {
      const diffMs = new Date().getTime() - sessao.iniciadaEm.getTime();
      let minutosUsados = Math.ceil(diffMs / 60000);
      if (minutosUsados === 0) minutosUsados = 1;

      minutosRestantes = sessao.vaga.limiteTempo - minutosUsados;
      if (minutosRestantes < 0) minutosRestantes = 0;
      
      valorAtual = minutosUsados * sessao.vaga.valorMinuto;
    } else {
      valorAtual = sessao.valorCobrado || 0;
    }

    res.json({
      sucesso: true,
      dados: {
        ...sessao,
        minutosRestantes,
        valorAtual
      }
    });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: "Erro ao buscar sessão" });
  }
});

export default router;
