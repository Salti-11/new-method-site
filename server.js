// Zero-dependency static server for the Method Endurance site.
// Clean URLs (/chris serves chris.html), 301s from .html and trailing slashes, a 404 page, gzip, and the form endpoint.
// Run: node server.js [folder]   (folder defaults to ./public, port to $PORT or 3000)
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, 'public'));
const PORT = process.env.PORT || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.ico': 'image/x-icon' };
const GZ = new Set(['.html', '.css', '.js', '.json', '.txt', '.xml', '.svg']);

function resolve(p) {
  const tries = [p, p + '.html', path.join(p, 'index.html')];
  for (const t of tries) { const f = path.join(ROOT, t); if (f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()) return f; }
  return null;
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = decodeURIComponent(url.pathname);
  const headers = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };

  if (p === '/api/assessment' && req.method === 'POST') {
    // Replit: replace this stub. Read the JSON body (experience, challenge, goal, name, email, phone, heard),
    // email it to chris@methodendurance.com.au, and return 200. Notify Chris only; never email the athlete.
    res.writeHead(501, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'not_configured' }));
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, headers); return res.end(); }

  // 301 to the clean URL
  let clean = p.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (clean.length > 1 && clean.endsWith('/')) clean = clean.slice(0, -1);
  if (clean !== p) { res.writeHead(301, { ...headers, Location: clean + url.search }); return res.end(); }

  const file = resolve(p);
  if (!file) {
    const nf = path.join(ROOT, '404.html');
    res.writeHead(404, { ...headers, 'Content-Type': TYPES['.html'] });
    return res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found');
  }
  const ext = path.extname(file);
  headers['Content-Type'] = TYPES[ext] || 'application/octet-stream';
  headers['Cache-Control'] = ['.html', '.xml', '.txt', '.css', '.js'].includes(ext) ? 'no-cache' : 'public, max-age=86400';
  if (ext === '.mp4') {
    const size = fs.statSync(file).size, range = req.headers.range;
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range); const start = m[1] ? +m[1] : 0, end = m[2] ? +m[2] : size - 1;
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(200, { ...headers, 'Accept-Ranges': 'bytes', 'Content-Length': size });
    return fs.createReadStream(file).pipe(res);
  }
  if (GZ.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    headers['Content-Encoding'] = 'gzip'; headers['Vary'] = 'Accept-Encoding';
    res.writeHead(200, headers);
    return req.method === 'HEAD' ? res.end() : res.end(zlib.gzipSync(fs.readFileSync(file)));
  }
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log('Method Endurance site on http://localhost:' + PORT));
