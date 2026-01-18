import { Request, Response } from "express";
import { CreateProductService } from "../../services/product/CreateProductService";

class CreateProductController {
  async handle(req: Request, res: Response) {
    const { name, price, description, category_id } = req.body;

    // Campos obrigatórios (sem falsear zero)
    const missing =
      !name?.toString().trim() ||
      !description?.toString().trim() ||
      !category_id?.toString().trim() ||
      (price === undefined || price === null || price === "");

    if (missing) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    // Normaliza preço aceitando '49,90' ou '49.90'
    let numericPrice: number;
    if (typeof price === "number") {
      numericPrice = price;
    } else {
      const normalized = price.toString().replace(',', '.').trim();
      numericPrice = Number(normalized);
    }

    if (!Number.isFinite(numericPrice)) {
      return res.status(400).json({ error: "Preço inválido." });
    }

    // banner é opcional
    const banner = req.file?.filename ?? "";

    try {
      const createProductService = new CreateProductService();
      const product = await createProductService.execute({
        name: name.toString().trim(),
        price: numericPrice,
        description: description.toString().trim(),
        banner, // verifique se o service aceita string vazia; se não, valide aqui
        category_id: category_id.toString().trim() // se for number, faça Number(category_id)
      });

      return res.status(201).json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar produto." });
    }
  }
}

export { CreateProductController };
