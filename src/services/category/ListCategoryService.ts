import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ListCategoryService {
  async execute() {
    const category = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" }, // opcional: resultados ordenados
    });

    return category;
  }
}

export { ListCategoryService };
