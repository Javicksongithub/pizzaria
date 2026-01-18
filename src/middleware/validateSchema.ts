import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

// Usei AnyZodObject para garantir que o schema aceite o objeto { body, params, query }
export const validateSchema = (schema: ZodType ) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validamos o objeto completo (body, params e query)
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query
      });

      return next();

    } catch (error) {
      // Se for erro do Zod (validação)
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Erro na validação",
          details: error.issues.map((issue) => ({
            // slice(1) remove o prefixo 'body', 'params' ou 'query' do caminho
            campo: issue.path.slice(1).join('.'), 
            message: issue.message,
          }))
        });
      }

      // Se for qualquer outro erro inesperado
      return res.status(500).json({
        message: "Erro interno do servidor"
      });
    }
  };