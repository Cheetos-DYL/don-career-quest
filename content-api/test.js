import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { existsSync, renameSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const store = path.join(dir, 'content-store.json');
const backup = `${store}.test-backup`;
const hadStore = existsSync(store);
if (hadStore) renameSync(store, backup);

const portServer = createServer();
await new Promise((resolve, reject) => portServer.listen(0, '127.0.0.1', resolve).once('error', reject));
const { port } = portServer.address();
await new Promise(resolve => portServer.close(resolve));

const child = spawn(process.execPath, ['server.js'], {
  cwd: dir,
  env: { ...process.env, PORT: String(port), EDIT_TOKEN: 'test-token' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
child.stdout.on('data', chunk => { output += chunk; });
child.stderr.on('data', chunk => { output += chunk; });

try {
  const base = `http://127.0.0.1:${port}`;
  let response;
  for (let i = 0; i < 100; i += 1) {
    try {
      response = await fetch(`${base}/api/health`);
      break;
    } catch {
      if (child.exitCode !== null) throw new Error(`server exited early: ${output}`);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  assert.ok(response, `server did not start: ${output}`);
  assert.deepEqual(await response.json(), { ok: true });

  response = await fetch(`${base}/api/content`);
  assert.equal(response.status, 200);
  const seeded = await response.json();
  assert.equal(seeded.stops.length, 13);
  assert.equal(seeded.stops[0].id, 'stop-01');
  assert.equal(seeded.stops[12].id, 'stop-13');
  assert.ok(typeof seeded.updatedAt === 'string');

  const changed = { ...seeded, updatedAt: undefined, intro: { title: 'Changed', text: 'Saved' } };
  delete changed.updatedAt;
  response = await fetch(`${base}/api/content`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changed),
  });
  assert.equal(response.status, 401);
  response = await fetch(`${base}/api/content`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer wrong-token' }, body: JSON.stringify(changed),
  });
  assert.equal(response.status, 401);
  response = await fetch(`${base}/api/content`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' }, body: JSON.stringify(changed),
  });
  assert.equal(response.status, 200);
  const saved = await response.json();
  assert.equal(saved.ok, true);
  assert.ok(typeof saved.updatedAt === 'string');
  response = await fetch(`${base}/api/content`);
  const fetched = await response.json();
  assert.equal(fetched.intro.title, 'Changed');
  assert.equal(fetched.intro.text, 'Saved');
  assert.equal(fetched.stops.length, 13);
  assert.ok(typeof fetched.updatedAt === 'string');

  response = await fetch(`${base}/api/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
    body: JSON.stringify({ payload: 'x'.repeat(21 * 1024 * 1024) }),
  });
  assert.equal(response.status, 413);
  console.log('all tests passed');
} finally {
  if (child.exitCode === null) {
    child.kill('SIGTERM');
    await new Promise(resolve => child.once('exit', resolve));
  }
  if (existsSync(store)) unlinkSync(store);
  if (hadStore && existsSync(backup)) renameSync(backup, store);
}
