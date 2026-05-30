import { Router } from "express";
import { prisma } from "../server.js";

const router = Router();

// Registro do Motorista (Conta Pessoal)
router.post("/registro", async (req, res) => {
  try {
    const { cpf, nome, senha, idade } = req.body;

    if (!cpf || !nome || !senha) {
      return res.status(400).json({ erro: "CPF, nome e senha são obrigatórios" });
    }

    const existe = await prisma.motorista.findUnique({ where: { cpf } });
    if (existe) {
      return res.status(400).json({ erro: "CPF já cadastrado" });
    }

    const motorista = await prisma.motorista.create({
      data: {
        cpf,
        nome,
        senha,
        idade: idade ? parseInt(idade) : null,
        creditos: 0.0
      }
    });

    res.status(201).json({ sucesso: true, motorista });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao cadastrar motorista" });
  }
});

// Login do Motorista
router.post("/login", async (req, res) => {
  try {
    const { cpf, senha } = req.body;

    const motorista = await prisma.motorista.findUnique({
      where: { cpf },
      include: {
        vinculos: {
          include: { empresa: true }
        }
      }
    });

    if (!motorista || motorista.senha !== senha) {
      return res.status(401).json({ erro: "CPF ou senha inválidos" });
    }

    if (motorista.status === "DESATIVADO") {
      return res.status(403).json({ erro: "Login desativado" });
    }

    res.json({ sucesso: true, motorista });
  } catch (error) {
    res.status(500).json({ erro: "Erro no login" });
  }
});

// Buscar Perfil Completo (Veiculos Pessoais + Empresas Vinculadas + Atribuicoes)
router.get("/:id/perfil", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const motorista = await prisma.motorista.findUnique({
      where: { id },
      include: {
        veiculos: true, // Veículos pessoais
        atribuicoes: {
          include: { veiculo: true }
        },
        vinculos: {
          where: { status: "ATIVO" },
          include: { 
            empresa: true
          }
        }
      }
    });

    if (!motorista) return res.status(404).json({ erro: "Motorista não encontrado" });

    // Filtrar vínculos expirados
    const vinculosValidos = motorista.vinculos.filter(v => {
      if (v.tipoAcesso === "TEMPORARIO" && v.expiraEm && new Date() > v.expiraEm) {
        return false;
      }
      return true;
    });

    // Injetar os veículos atribuídos dentro de cada empresa respectiva
    const vinculosComVeiculos = vinculosValidos.map(vinc => {
      const veiculosAtribuidos = motorista.atribuicoes
        .filter(a => a.veiculo.empresaId === vinc.empresaId)
        .map(a => a.veiculo);
      
      return {
        ...vinc,
        empresa: {
          ...vinc.empresa,
          veiculos: veiculosAtribuidos
        }
      };
    });

    // Remover `atribuicoes` do retorno direto para manter a API limpa
    const { atribuicoes, vinculos, ...rest } = motorista;

    res.json({ sucesso: true, dados: { ...rest, vinculos: vinculosComVeiculos } });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar perfil" });
  }
});

// Adicionar Créditos Pessoais (Simulação)
router.post("/:id/creditos", async (req, res) => {
  try {
    const { valor } = req.body;
    if (!valor || valor <= 0) return res.status(400).json({ erro: "Valor inválido" });

    const motorista = await prisma.motorista.update({
      where: { id: parseInt(req.params.id) },
      data: { creditos: { increment: valor } }
    });

    res.json({ sucesso: true, creditos: motorista.creditos });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao adicionar créditos" });
  }
});

export default router;
