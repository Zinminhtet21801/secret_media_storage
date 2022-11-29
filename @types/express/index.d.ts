type User = { id: number; fullName: string; email: string };

declare namespace Express {
  export interface Request {
    user: User;
  }
}
