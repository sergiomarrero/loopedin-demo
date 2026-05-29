import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export type Principal =
  | { kind: 'member'; id: string }
  | { kind: 'org'; id: string };

export function signToken(p: Principal): string {
  return jwt.sign(p, SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): Principal | null {
  try {
    return jwt.verify(token, SECRET) as Principal;
  } catch {
    return null;
  }
}

// Express adds `principal` to the request once authenticated.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      principal?: Principal;
    }
  }
}

function readToken(req: Request): string | null {
  const h = req.headers.authorization;
  if (h && h.startsWith('Bearer ')) return h.slice(7);
  return null;
}

export function requireMember(req: Request, res: Response, next: NextFunction) {
  const token = readToken(req);
  const p = token ? verifyToken(token) : null;
  if (!p || p.kind !== 'member') return res.status(401).json({ error: 'Member auth required' });
  req.principal = p;
  next();
}

export function requireOrg(req: Request, res: Response, next: NextFunction) {
  const token = readToken(req);
  const p = token ? verifyToken(token) : null;
  if (!p || p.kind !== 'org') return res.status(401).json({ error: 'Org auth required' });
  req.principal = p;
  next();
}
