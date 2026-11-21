import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const root = process.cwd();
async function fixture(run, overrides = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), 'teecake-test-'));
  await mkdir(path.join(dir, 'dist'));
  await writeFile(path.join(dir, 'dist/index.html'), '<html><head></head><body></body></html>');
  const child = spawn(process.execPath, ['--import', path.join(root, 'tests/no-network-server.mjs'), '--import', path.join(root, 'node_modules/tsx/dist/loader.mjs'), path.join(root, 'server.ts')], {
    cwd: dir, env: { ...process.env, NODE_ENV: 'production', PORT: '3000', NGINX_PORT: '', DATA_DIR: path.join(dir, 'persistent'), ADMIN_1_EMAIL: 'one@example.test', ADMIN_1_PASSWORD: 'First-secure-password-123', ADMIN_2_EMAIL: 'two@example.test', ADMIN_2_PASSWORD: 'Second-secure-password-123', ...overrides }, stdio: 'pipe',
  });
  let seq = 0;
  const pending = new Map();
  const { createInterface } = await import('node:readline');
  const lines = createInterface({ input: child.stdout });
  const ready = new Promise(resolve => {
    lines.on('line', line => {
      if (line.startsWith('Server running')) resolve();
      if (!line.startsWith('{')) return;
      const result = JSON.parse(line);
      pending.get(result.id)?.(result);
      pending.delete(result.id);
    });
  });
  let cookie = '';
  const request = async (url, body, method = 'GET', authenticated = true, extraHeaders = {}) => {
    const id = ++seq;
    const resultPromise = new Promise(resolve => pending.set(id, resolve));
    child.stdin.write(JSON.stringify({ id, url, body, method, headers: { ...(authenticated && cookie ? { cookie } : {}), ...extraHeaders } }) + '\n');
    const result = await resultPromise;
    const bytes = Buffer.from(result.body, 'base64');
    return { status: result.status, headers: result.headers, json: async () => JSON.parse(bytes.toString()), text: async () => bytes.toString(), arrayBuffer: async () => bytes };
  };
  try {
    await ready;
    const login = await request('/api/auth/login', { email: 'one@example.test', password: 'First-secure-password-123' }, 'POST', false);
    const cookies = login.headers['set-cookie'];
    cookie = (Array.isArray(cookies) ? cookies[0] : cookies || '').split(';')[0];
    await run({ dir, request });
  } finally {
    if (child.exitCode === null) { child.kill('SIGTERM'); await once(child, 'exit'); }
    await rm(dir, { recursive: true, force: true });
  }
}
const post = (request, url, body) => request(url, body, 'POST');

test('uploads reject invalid image data instead of reporting success', () => fixture(async ({ request }) => {
  const res = await post(request, '/api/upload', { dataUrl: 'not-an-image' });
  assert.equal(res.status, 400);
}));
test('configured persistent storage keeps images outside replaceable build directories', () => fixture(async ({ dir, request }) => {
  const res = await post(request, '/api/upload', { dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', filename: '../cake' });
  const { url: imageUrl } = await res.json();
  const bytes = await readFile(path.join(dir, 'persistent/uploads', path.basename(imageUrl)));
  await rm(path.join(dir, 'dist'), { recursive: true });
  const image = await request(imageUrl);
  assert.equal(image.status, 200);
  assert.deepEqual(Buffer.from(await image.arrayBuffer()), bytes);
}));
test('corrupt main state recovers backup without losing previous fields on next save', () => fixture(async ({ dir, request }) => {
  await post(request, '/api/app-data', { items: [], contact: { name: 'Bakery' } });
  // Locate the configured directory, or legacy directory before the fix.
  let dataDir = path.join(dir, 'persistent');
  try { await readFile(path.join(dataDir, 'shared-app-state.json')); } catch { dataDir = path.join(dir, 'data'); }
  await writeFile(path.join(dataDir, 'shared-app-state.json'), '{broken');
  const response = await request('/api/app-data');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.contact.name, 'Bakery');
  await post(request, '/api/app-data', { pageTexts: { title: 'Hello' } });
  assert.equal(JSON.parse(await readFile(path.join(dataDir, 'shared-app-state.json'), 'utf8')).contact.name, 'Bakery');
}));
test('saved text cannot break out of injected state script', () => fixture(async ({ request }) => {
  await post(request, '/api/app-data', { pageTexts: { title: '</script><script>alert(1)</script>' } });
  const html = await (await request('/')).text();
  assert.ok(!html.includes('</script><script>alert(1)'));
}));

test('visitors can read but cannot change state, upload, or change library', () => fixture(async ({ request }) => {
  assert.equal((await request('/api/app-data', undefined, 'GET', false)).status, 200);
  for (const [url, method, body] of [
    ['/api/app-data', 'POST', { items: [] }],
    ['/api/upload', 'POST', { dataUrl: 'data:image/png;base64,YQ==' }],
    ['/api/library-photos', 'POST', { photo: { url: 'https://example.test/a.png' } }],
    ['/api/library-photos/anything', 'DELETE', {}],
    ['/api/library-photos/reset', 'POST', {}],
  ]) assert.equal((await request(url, body, method, false)).status, 401, url);
}));
test('only configured admins can login and logout invalidates access', () => fixture(async ({ request }) => {
  assert.equal((await request('/api/auth/login', { email: 'one@example.test', password: 'wrong' }, 'POST', false)).status, 401);
  assert.equal((await request('/api/auth/login', { email: 'stranger@example.test', password: 'First-secure-password-123' }, 'POST', false)).status, 401);
  const second = await request('/api/auth/login', { email: 'two@example.test', password: 'Second-secure-password-123' }, 'POST', false);
  assert.equal(second.status, 200);
  assert.ok(String(second.headers['set-cookie']).includes('HttpOnly'));
  assert.equal((await request('/api/auth/session')).status, 200);
  assert.equal((await (await request('/api/auth/session')).json()).isAdmin, true);
  await request('/api/auth/logout', {}, 'POST');
  assert.equal((await request('/api/app-data', { items: [] }, 'POST')).status, 401);
}));

test('cross-site authenticated changes are blocked', () => fixture(async ({ request }) => {
  const response = await request('/api/app-data', { items: [] }, 'POST', true, { origin: 'https://attacker.example' });
  assert.equal(response.status, 403);
}));
test('missing second account leaves edits locked', () => fixture(async ({ request }) => {
  const login = await request('/api/auth/login', { email: 'one@example.test', password: 'First-secure-password-123' }, 'POST', false);
  assert.equal(login.status, 503);
  assert.equal((await request('/api/app-data', { items: [] }, 'POST')).status, 401);
}, { ADMIN_2_EMAIL: '', ADMIN_2_PASSWORD: '' }));
test('upload storage failures do not return a successful image URL', () => fixture(async ({ dir, request }) => {
  await rm(path.join(dir, 'persistent/uploads'), { recursive: true, force: true });
  await writeFile(path.join(dir, 'persistent/uploads'), 'not a directory');
  const response = await post(request, '/api/upload', { dataUrl: 'data:image/png;base64,YQ==' });
  assert.equal(response.status, 500);
  assert.equal((await response.json()).url, undefined);
}));
test('stale admin saves cannot overwrite newer site content', () => fixture(async ({ request }) => {
  const first = await (await post(request, '/api/app-data', { items: [], pageTexts: { title: 'First' } })).json();
  await post(request, '/api/app-data', { pageTexts: { title: 'Newer edit' } });
  const stale = await request('/api/app-data', { pageTexts: { title: 'Stale edit' } }, 'POST', true, { 'if-match': first.data.stateRevision || first.data.serverSavedAt });
  assert.equal(stale.status, 409);
  assert.equal((await (await request('/api/app-data')).json()).data.pageTexts.title, 'Newer edit');
}));
test('library edits do not invalidate the same admin site revision', () => fixture(async ({ request }) => {
  const first = await (await post(request, '/api/app-data', { items: [] })).json();
  await post(request, '/api/library-photos', { photo: { id: 'new-photo', url: 'https://example.test/cake.png' } });
  const saved = await request('/api/app-data', { pageTexts: { title: 'Edited' } }, 'POST', true, { 'if-match': first.data.stateRevision });
  assert.equal(saved.status, 200);
  assert.ok((await saved.json()).data.libraryPhotos.some(photo => photo.id === 'new-photo'));
}));
