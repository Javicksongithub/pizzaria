import { Request, Response, NextFunction } from "express";
import { verify, JwtPayload } from "jsonwebtoken";

interface Payload extends JwtPayload {
  sub: string; // id do usuário
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header ausente" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Formato do header inválido. Use: Bearer <token>" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // importante pra detectar problema de env
    return res.status(500).json({ error: "JWT_SECRET não configurado no servidor" });
  }

  try {
    const decoded = verify(token, secret) as Payload;
    if (!decoded?.sub) {
      return res.status(401).json({ error: "Token sem subject (sub)" });
    }
    
    req.user_id = decoded.sub;
    return next();
  } catch (err: any) {
    console.error("JWT error:", err?.message || err);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
