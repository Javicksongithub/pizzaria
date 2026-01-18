import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import 'express-async-errors';
import cors from 'cors';
import multer from 'multer'; // import necessário para checar MulterError

import { router } from './routes'; // Certifique-se de que este caminho está correto

const app = express();
app.use(express.json());
app.use(cors());
app.use(router);

// Middleware global de tratamento de erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Caso o erro seja do multer (upload)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: err.code,
      message: err.message,
    });
  }

  // Caso seja um erro lançado pela aplicação
  if (err instanceof Error) {
    return res.status(400).json({
      error: err.message,
    });
  }

  // Caso seja qualquer outro erro não tratado
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error.',
  });
});

app.listen(3333, () => console.log('Servidor online!!'));
