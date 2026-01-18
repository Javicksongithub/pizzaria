import prisma from "../../prisma";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

interface AuthRequest {
  email: string;
  password: string;
}

class AuthUserService {
  async execute({ email, password }: AuthRequest) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const rawPassword = String(password || "").trim();

    if (!normalizedEmail || !rawPassword) {
      throw new Error("usuario/ senha incorretos!");
    }

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw new Error("usuario/ senha incorretos!");
    }

    const isPasswordValid = await compare(rawPassword, user.password);

    if (!isPasswordValid) {
      throw new Error("usuario/ senha incorretos!");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não configurado no servidor");
    }

    const token = sign(
      { name: user.name, email: user.email },
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: "30d",
      }
    );

    return { id: user.id, name: user.name, email: user.email, token };
  }
}

export { AuthUserService };
