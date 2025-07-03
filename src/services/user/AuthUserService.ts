import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface AuthRequest {
  email: string;
  password: string;
}

class AuthUserService {
  async execute({ email, password }: AuthRequest) {
    // Verificar se o usuário existe pelo e-mail
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    // Verificar se o usuário foi encontrado
    if (!user) {
      throw new Error ("usuario/ senha incorretos!");
    }

    // Comparar a senha fornecida com a senha do banco de dados
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { ok: false, message: "Senha incorreta!" };
    }

    // Se o e-mail e a senha estiverem corretos
    return { ok: true, message: "Autenticação bem-sucedida!" };
  }
}

export { AuthUserService };
