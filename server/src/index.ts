import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { memberRouter } from './routes/member.js';
import { orgRouter } from './routes/org.js';
import { adminRouter } from './routes/admin.js';
import { voxRouter } from './routes/vox.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/member', memberRouter);
app.use('/api/org', orgRouter);
app.use('/api/admin', adminRouter);
// LoopedIn Vox — read-only insights layer (internal/org/export). Additive; does
// not touch the routes above. See server/src/routes/vox.ts.
app.use('/api/vox', voxRouter);

// In production we serve the built frontend from the same origin, so the app's
// relative `/api` calls work without any proxy or CORS config. (In dev, Vite
// serves the frontend and proxies /api here instead.)
const webDist = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  // Unknown non-API routes fall back to the landing page.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(webDist, 'index.html'));
  });
}

// Fallback error handler.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`LoopedIn API listening on http://localhost:${PORT}`);
});
