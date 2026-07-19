// Add our own field to Express's Request so the auth middleware can attach the
// logged-in user's id and controllers can read it in a type-safe way.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};
