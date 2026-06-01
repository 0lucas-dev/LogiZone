import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Registro de Empresa
router.post("/registro", async (req, res) => {
  try {
    const { cnpj, nome, tipo, senha } = req.body;
    if (!cnpj || !nome || !senha) return res.status(400).json({ erro: "Campos obrigatórios" });
    
    const existe = await prisma.empresa.findUnique({ where: { cnpj } });
    if (existe) return res.status(400).json({ erro: "CNPJ já cadastrado" });

    const empresa = await prisma.empresa.create({
      data: { cnpj, nome, tipo: tipo || "EMPRESA", senha, creditos: 0.0 }
    });
    res.status(201).json({ sucesso: true, empresa });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao cadastrar empresa" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { cnpj, senha } = req.body;
    const empresa = await prisma.empresa.findUnique({ where: { cnpj } });

    if (!empresa || empresa.senha !== senha) {
      return res.status(401).json({ erro: "CNPJ ou senha inválidos" });
    }
    res.json({ sucesso: true, empresa });
  } catch (error) {
    res.status(500).json({ erro: "Erro no login" });
  }
});

// Perfil Empresa
router.get("/:id", async (req, res) => {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        veiculos: {
          include: {
            atribuicoes: {
              include: { motorista: true }
            }
          }
        },
        vinculos: {
          include: { motorista: true }
        }
      }
    });
    if (!empresa) return res.status(404).json({ erro: "Empresa não encontrada" });
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar empresa" });
  }
});

// Adicionar Créditos
router.post("/:id/creditos", async (req, res) => {
  try {
    const { valor } = req.body;
    if (!valor || valor <= 0) return res.status(400).json({ erro: "Valor inválido" });
    const empresa = await prisma.empresa.update({
      where: { id: parseInt(req.params.id) },
      data: { creditos: { increment: valor } }
    });
    res.json({ sucesso: true, creditos: empresa.creditos });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao adicionar créditos" });
  }
});

// Vincular Motorista
router.post("/:id/vincular", async (req, res) => {
  try {
    const empresaId = parseInt(req.params.id);
    const { cpf, tipoAcesso, expiraEm } = req.body;

    const motorista = await prisma.motorista.findUnique({ where: { cpf } });
    if (!motorista) return res.status(404).json({ erro: "Motorista não encontrado" });

    // Tentar criar ou atualizar vínculo
    const vinculo = await prisma.vinculo.upsert({
      where: { motoristaId_empresaId: { motoristaId: motorista.id, empresaId } },
      update: {
        status: "ATIVO",
        tipoAcesso: tipoAcesso || "FIXO",
        expiraEm: expiraEm ? new Date(expiraEm) : null
      },
      create: {
        motoristaId: motorista.id,
        empresaId,
        tipoAcesso: tipoAcesso || "FIXO",
        expiraEm: expiraEm ? new Date(expiraEm) : null
      }
    });

    res.json({ sucesso: true, vinculo });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao vincular motorista" });
  }
});

// Desvincular Motorista (Status DESATIVADO)
router.post("/:id/desvincular", async (req, res) => {
  try {
    const empresaId = parseInt(req.params.id);
    const { motoristaId } = req.body;

    const vinculo = await prisma.$transaction(async (tx) => {
      const vinc = await tx.vinculo.update({
        where: { motoristaId_empresaId: { motoristaId: parseInt(motoristaId), empresaId } },
        data: { status: "DESATIVADO" }
      });

      // Remove atribuições a veículos desta empresa
      const veiculos = await tx.veiculo.findMany({ where: { empresaId } });
      const ids = veiculos.map(v => v.id);
      
      if (ids.length > 0) {
        await tx.atribuicaoVeiculo.deleteMany({
          where: {
            motoristaId: parseInt(motoristaId),
            veiculoId: { in: ids }
          }
        });
      }
      return vinc;
    });

    res.json({ sucesso: true, vinculo });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao desvincular motorista" });
  }
});

// Histórico de Sessões da Empresa
router.get("/:id/historico", async (req, res) => {
  try {
    const empresaId = parseInt(req.params.id);

    const sessoes = await prisma.sessao.findMany({
      where: {
        OR: [
          { pagadorTipo: "EMPRESA", pagadorId: empresaId },
          { veiculo: { empresaId: empresaId } }
        ]
      },
      include: {
        vaga: true,
        veiculo: true,
        motorista: true
      },
      orderBy: {
        iniciadaEm: 'desc'
      }
    });

    res.json({ sucesso: true, sessoes });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar histórico da empresa" });
  }
});

export default router;
