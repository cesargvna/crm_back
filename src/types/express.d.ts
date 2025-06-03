// src/types/express.d.ts
import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      roleId: string;
      tenantId: string;
      role: {
        name: string;
      };
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
