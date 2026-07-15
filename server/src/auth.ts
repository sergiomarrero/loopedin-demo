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

// Staff gate for /api/admin/* — a hard launch blocker for the messaging layer.
// Behavior:
//   • ADMIN_API_TOKEN set        → require it (Bearer header or x-admin-token).
//   • unset, NODE_ENV=production → FAIL CLOSED (503): admin is disabled until
//     the token is configured. Never ship open admin routes.
//   • unset, dev                 → open (preserves the local demo workflow).
export function requireStaff(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ error: 'admin disabled: ADMIN_API_TOKEN not configured' });
    }
    return next();
  }
  const provided = readToken(req) || (req.headers['x-admin-token'] as string | undefined) || '';
  if (provided !== expected) return res.status(403).json({ error: 'staff auth required' });
  next();
}
