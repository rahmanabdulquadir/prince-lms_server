// src/types/express.d.ts
import { User } from '@prisma/client'; // or your User interface if you're not using Prisma

declare module 'express' {
  interface Request {
    user?: {
      userId: string;
      email: string;
      isSubscribed: boolean;
    };
  }
}
