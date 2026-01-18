import prisma from "../../prisma";
import { hash, compare } from "bcryptjs";

interface UserRequest {
  name: string;
  email: string;
  password: string;
}

class CreateUserService {
  async execute({ name, email, password }: UserRequest) {
    const normalizedName = String(name || "")
      .trim()
      .replace(/\s+/g, " ");

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    const rawPassword = String(password || "").trim();

    if (!normalizedName) throw new Error("Nome é obrigatório");
    if (!normalizedEmail) throw new Error("E-mail é obrigatório");
    if (!rawPassword) throw new Error("Senha é obrigatória");
    if (rawPassword.length < 6) throw new Error("Senha deve ter no mínimo 6 caracteres");

    const emailAlreadyExists = await prisma.user.findFirst({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (emailAlreadyExists) throw new Error("E-mail já cadastrado");

    const nameAlreadyExists = await prisma.user.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (nameAlreadyExists) throw new Error("Nome de usuário já cadastrado");

    const usersWithPasswords = await prisma.user.findMany({
      select: { id: true, password: true },
    });

    for (const u of usersWithPasswords) {
      const samePassword = await compare(rawPassword, u.password);
      if (samePassword) {
        throw new Error("Essa senha já está sendo usada por outro usuário");
      }
    }

    const passwordHash = await hash(rawPassword, 8);

    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true, // ✅ ADICIONEI AQUI
      },
    });

    return user;
  }
}

export { CreateUserService };
