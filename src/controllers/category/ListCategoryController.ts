import { Request, Response } from "express";
import { ListCategoryService } from "../../services/category/ListCategoryService";

class ListCategoryController {
  async handle(req: Request, res: Response) {
    try {
      const listCategoryService = new ListCategoryService();
      const categories = await listCategoryService.execute();
      return res.json(categories);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao listar categorias" });
    }
  }
}

export { ListCategoryController };
