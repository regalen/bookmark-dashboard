import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST = join(__dirname, 'dist');
const DATA_DIR = process.env.DATA_DIR ?? '/data';
const DATA_FILE = join(DATA_DIR, 'settings.json');

mkdirSync(DATA_DIR, { recursive: true });

const DEFAULT_SETTINGS = { bookmarks: [], groups: [], theme: 'system', title: 'Bookmarks' };
let settings = { ...DEFAULT_SETTINGS };

if (existsSync(DATA_FILE)) {
  try {
    settings = { ...DEFAULT_SETTINGS, ...JSON.parse(readFileSync(DATA_FILE, 'utf-8')) };
  } catch {}
}

// Migration: if no groups exist, create a default 'Personal' group and assign
// all existing bookmarks to it. Persists immediately so it only runs once.
if (!Array.isArray(settings.groups) || settings.groups.length === 0) {
  const personalGroup = { id: 'personal', name: 'Personal', createdAt: Date.now() };
  settings.groups = [personalGroup];
  settings.bookmarks = settings.bookmarks.map(b => ({
    ...b,
    groupIds: Array.isArray(b.groupIds) && b.groupIds.length > 0 ? b.groupIds : ['personal'],
  }));
  try { writeFileSync(DATA_FILE, JSON.stringify(settings)); } catch {}
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.png':  'image/png',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff':  'font/woff',
};

function serveFile(res, filePath) {
  try {
    const content = readFileSync(filePath);
    const mime = MIME_TYPES[extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  } catch {
    const html = readFileSync(join(DIST, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/settings') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(settings));
      return;
    }

    if (req.method === 'PATCH') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => {
        try {
          const patch = JSON.parse(Buffer.concat(chunks).toString());
          settings = { ...settings, ...patch };
          writeFileSync(DATA_FILE, JSON.stringify(settings));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400);
          res.end('Bad request');
        }
      });
      return;
    }
  }

  const filePath = url.pathname === '/'
    ? join(DIST, 'index.html')
    : join(DIST, url.pathname);
  serveFile(res, filePath);
});

const PORT = process.env.PORT ?? 5173;
server.listen(PORT, () =>
  console.log(`Bookmark Dashboard running on http://localhost:${PORT}`)
);
