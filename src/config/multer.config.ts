// src/common/config/multer.config.ts
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

export const videoMulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const folder =
        file.fieldname === 'thumbnail'
          ? 'uploads/thumbnails'
          : 'uploads/videos';

      // Create the folder if it doesn't exist
      fs.mkdirSync(folder, { recursive: true });

      cb(null, folder);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName =
        file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
      cb(null, uniqueName);
    },
  }),
};
