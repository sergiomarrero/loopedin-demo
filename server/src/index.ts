import express from 'express';
import cors from 'cors';
import { memberRouter } from './routes/member.js';
import { orgRouter } from './routes/org.js';
import { adminRouter } from './routes/admin.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/member', memberRouter);
app.use('/api/org', orgRouter);
app.use('/api/admin', adminRouter);

// Fallback error handler.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`LoopedIn API listening on http://localhost:${PORT}`);
});
