// Local preview of public/ that follows _redirects and 404.html the way Cloudflare does.
//   node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const port = Number(process.argv[2] || 8788);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.xml': 'application/xml', '.svg': 'image/svg+xml' };
const rules = (await readFile(join(pub, '_redirects'), 'utf8')).split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/));

async function file(path) {
  for (const p of [path, join(path, 'index.html')]) {
    try { if ((await stat(p)).isFile()) return p; } catch {}
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  for (const [from, to, code] of rules) {
    const m = from.endsWith('/*') ? url.pathname.startsWith(from.slice(0, -1)) && url.pathname.slice(from.length - 1) : url.pathname === from && '';
    if (m !== false && m !== undefined) { res.writeHead(Number(code), { location: to.replace(':splat', m) }); return res.end(); }
  }
  if (url.pathname.length > 1 && !extname(url.pathname) && !url.pathname.endsWith('/')) {
    if (await file(join(pub, url.pathname, 'index.html'))) { res.writeHead(307, { location: url.pathname + '/' }); return res.end(); }
  }
  const hit = await file(join(pub, decodeURIComponent(url.pathname)));
  const path = hit || join(pub, '404.html');
  res.writeHead(hit ? 200 : 404, { 'content-type': types[extname(path)] || 'application/octet-stream' });
  res.end(await readFile(path));
}).listen(port, () => console.log(`http://localhost:${port}`));
