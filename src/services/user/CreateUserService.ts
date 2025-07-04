import { PrismaClient } from '@prisma/client';
import {hash}from 'bcryptjs'

const prismaClient = new PrismaClient();

interface UserRequest {
  name: string;
  email: string;
  password: string;
}

class CreateUserService {
  async execute({ name, email, password }: UserRequest) {

    // Verificar se ele enviou um email
    if (!email) {
      throw new Error("Email incorrect");
    }

    // Verificar se esse email já está cadastrado na plataforma
    const userAlreadyExists = await prismaClient.user.findFirst({
      where: {
        email: email
      }
    });

    // Se o usuário já existe, lançar um erro
    if (userAlreadyExists) {
      throw new Error("User already exists");
    }
     const passwordHash = await hash(password,8)
    // Adicione aqui a criação do usuário, por exemplo
    const user = await prismaClient.user.create({
      data: {
        name:name,
        email: email,
        password:passwordHash, // Adapte conforme necessário
      }, 
      select:{
        id:true,
        name:true,
        email:true
      }
    });

    return user;
  }
}

export { CreateUserService };
