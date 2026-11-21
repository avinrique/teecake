// Exercise the real Express middleware without binding a network port.
import http from 'node:http';
import { Readable, Writable } from 'node:stream';
import { createInterface } from 'node:readline';
http.Server.prototype.listen = function (...args) {
  const server = this;
  const callback = args.find(arg => typeof arg === 'function');
  queueMicrotask(() => callback?.());
  createInterface({ input: process.stdin }).on('line', line => {
    const { id, url, method, body, headers } = JSON.parse(line);
    const bytes = body === undefined ? '' : JSON.stringify(body);
    const req = Readable.from(bytes ? [Buffer.from(bytes)] : []);
    req.url = url; req.method = method || 'GET';
    req.headers = { 'content-type': 'application/json', 'content-length': Buffer.byteLength(bytes), accept: 'text/html', host: 'localhost:3000', ...headers };
    req.socket = { remoteAddress: '127.0.0.1' };
    req.connection = req.socket;
    const res = new http.ServerResponse(req);
    const chunks = [];
    const socket = new Writable({ write(chunk, encoding, done) { chunks.push(Buffer.from(chunk)); done(); } });
    res.assignSocket(socket);
    res.on('finish', () => {
      const output = Buffer.concat(chunks);
      const start = output.indexOf('\r\n\r\n') + 4;
      process.stdout.write(JSON.stringify({ id, status: res.statusCode, headers: res.getHeaders(), body: output.subarray(start).toString('base64') }) + '\n');
    });
    server.emit('request', req, res);
  });
  return this;
};
