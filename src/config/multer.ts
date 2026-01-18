// src/config/multer.ts
import fs from 'fs';
import crypto from 'crypto';
import multer, { FileFilterCallback, Multer } from 'multer';
import { extname, resolve } from 'path';

export default {
  // 👇 tipo explícito resolve “.single is not a function / não existe”
  upload(folder: string): Multer {
    return multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const dir = resolve(__dirname, '..', '..', folder);
          fs.mkdirSync(dir, { recursive: true }); // evita ENOENT
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const hash = crypto.randomBytes(16).toString('hex');
          cb(null, `${hash}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, cb: FileFilterCallback) => {
        const allowedExt = ['.jpg', '.jpeg', '.png', '.gif'];
        const allowedMime = ['image/jpeg', 'image/png', 'image/gif'];
        const ok =
          allowedExt.includes(extname(file.originalname).toLowerCase()) &&
          allowedMime.includes(file.mimetype);
        return ok ? cb(null, true) : cb(new Error('Tipo de arquivo não permitido.'));
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    });
  },
};
