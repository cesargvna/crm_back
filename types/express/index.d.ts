export {};

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      tenantId?: string;
      roleId: string;
      subsidiaryId: string;
    }

    interface Request {
      user?: User;
    }
  }
}
