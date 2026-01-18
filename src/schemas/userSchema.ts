import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Nome é obrigatório" })
      .trim()
      .min(3, { error: "Nome deve ter no mínimo 3 caracteres" })
      .max(120, { error: "Nome não pode exceder 120 caracteres" })
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/u, { error: "Nome deve conter apenas letras" }),

    email: z
      .string({ error: "E-mail é obrigatório" })
      .trim()
      .toLowerCase()
      .min(1, { error: "E-mail é obrigatório" })
      .email({ error: "E-mail inválido" }),

    password: z
      .string({ error: "Senha é obrigatória" })
      .min(1, { error: "Senha é obrigatória" })
      .min(6, { error: "Senha deve ter no mínimo 6 caracteres" })
      .max(100, { error: "Senha não pode exceder 100 caracteres" }),
  }),

  params: z.object({}).strict(),
  query: z.object({}).strict(),
});


export type CreateUserInput = z.infer<typeof createUserSchema>;
