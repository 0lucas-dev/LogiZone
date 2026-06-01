import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/**
 * Middleware global de tratamento de erros.
 * Padroniza todas as respostas de erro.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[ERRO] ${err.name}: ${err.message}`);

  // Erro de validação Zod
  if (err instanceof ZodError) {
    const mensagens = err.errors.map(e => `${e.path.join(".")}: ${e.message}`);
    res.status(400).json({
      sucesso: false,
      erro: "Dados inválidos",
      detalhes: mensagens,
    });
    return;
  }

  // Registro não encontrado (Prisma)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      res.status(404).json({
        sucesso: false,
        erro: "Registro não encontrado",
      });
      return;
    }

    // Violação de constraint unique
    if (err.code === "P2002") {
      const campo = (err.meta?.target as string[])?.join(", ") || "campo";
      res.status(409).json({
        sucesso: false,
        erro: `Registro duplicado: ${campo} já existe`,
      });
      return;
    }

    // Violação de FK
    if (err.code === "P2003") {
      res.status(400).json({
        sucesso: false,
        erro: "Referência inválida: registro relacionado não existe",
      });
      return;
    }
  }

  // Erro genérico
  res.status(500).json({
    sucesso: false,
    erro: "Erro interno do servidor",
  });
}

/**
 * Wrapper para handlers async/await — captura erros e passa para o errorHandler.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
