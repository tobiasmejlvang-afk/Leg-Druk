import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const name of ['index.html', 'sw.js']) await copyFile(resolve(root, name), resolve(out, name));
for (const name of ['src', 'public']) await cp(resolve(root, name), resolve(out, name), { recursive: true });
console.log('Build ready: dist/ — no dependencies or external services required.');

