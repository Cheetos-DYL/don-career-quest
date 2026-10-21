import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(dir, 'content-store.json');
const seed = JSON.parse(await readFile(path.join(dir, 'default-content.json'), 'utf8'));
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;
let content;
let updatedAt;

if (pool) {
  await pool.query('CREATE TABLE IF NOT EXISTS content (id int primary key default 1, data jsonb, updated_at timestamptz)');
  const result = await pool.query('SELECT data, updated_at FROM content WHERE id = 1');
  if (result.rowCount) {
    content = result.rows[0].data;
    updatedAt = new Date(result.rows[0].updated_at).toISOString();
  } else {
    content = seed;
    updatedAt = new Date().toISOString();
    await pool.query('INSERT INTO content (id, data, updated_at) VALUES (1, $1, $2) ON CONFLICT (id) DO NOTHING', [content, updatedAt]);
  }
} else {
  try {
    const saved = JSON.parse(await readFile(storePath, 'utf8'));
    content = saved.data;
    updatedAt = new Date(saved.updatedAt).toISOString();
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    content = seed;
    updatedAt = new Date().toISOString();
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '22mb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/content', (_req, res) => res.json({ ...content, updatedAt }));
app.post('/api/content', async (req, res, next) => {
  if (!process.env.EDIT_TOKEN) return res.status(503).json({ error: 'writes disabled' });
  if (req.get('Authorization') !== `Bearer ${process.env.EDIT_TOKEN}`) return res.status(401).json({ error: 'unauthorized' });
  if (!req.body || Object.getPrototypeOf(req.body) !== Object.prototype) return res.status(400).json({ error: 'body must be a JSON object' });
  if (JSON.stringify(req.body).length > 20_000_000) return res.status(413).json({ error: 'content too large' });
  try {
    const nextUpdatedAt = new Date().toISOString();
    if (pool) {
      await pool.query('INSERT INTO content (id, data, updated_at) VALUES (1, $1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at', [req.body, nextUpdatedAt]);
    } else {
      const temporary = `${storePath}.tmp`;
      await writeFile(temporary, JSON.stringify({ data: req.body, updatedAt: nextUpdatedAt }));
      await rename(temporary, storePath);
    }
    content = req.body;
    updatedAt = nextUpdatedAt;
    return res.json({ ok: true, updatedAt });
  } catch (error) {
    return next(error);
  }
});
app.use((error, _req, res, _next) => {
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'content too large' });
  return res.status(500).json({ error: 'internal server error' });
});

app.listen(process.env.PORT || 10000);
