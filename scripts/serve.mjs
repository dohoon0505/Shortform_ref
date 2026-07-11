/* ================================================================
   숏폼 연구소 · 로컬 개발 서버 (의존성 없음)
   실행:  node scripts/serve.mjs  (npm run serve)  →  http://127.0.0.1:8178
   templates.json 을 fetch 하므로 file:// 직접 열기 대신 이 서버로 확인하세요.
   ================================================================ */
import { createServer } from 'node:http';
import { readFile } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 8178;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = resolve(ROOT, '.' + p);
  if (!fp.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('forbidden');
  }
  readFile(fp, (e, data) => {
    if (e) {
      res.writeHead(404);
      return res.end('not found');
    }
    res.writeHead(200, {
      'Content-Type': MIME[extname(fp).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`숏폼 연구소 · http://127.0.0.1:${PORT} 에서 실행 중 (Ctrl+C 종료)`);
});
