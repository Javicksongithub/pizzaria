// src/controllers/user/CreateUserController.ts
import { Request, Response } from "express";
import { CreateUserService } from "../../services/user/CreateUserService";

class CreateUserController {
  async handle(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const createUserService = new CreateUserService();
      const user = await createUserService.execute({ name, email, password });

      // 201 Created e **sempre** com JSON no corpo
      return res.status(201).json(user);
    } catch (err: any) {
      // Garante corpo de erro em JSON
      return res.status(400).json({
        error: err?.message || "Create user failed"
      });
    }
  }
}

export { CreateUserController };
