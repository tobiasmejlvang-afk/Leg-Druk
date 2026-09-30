import { mkdir, copyFile, cp, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const target = process.argv.includes('--docs') ? 'docs' : 'dist';
const out = resolve(root, target);
if (out !== resolve(root, 'docs') && out !== resolve(root, 'dist')) throw new Error('Invalid build target');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const name of ['index.html', 'sw.js']) await copyFile(resolve(root, name), resolve(out, name));
for (const name of ['src', 'public']) await cp(resolve(root, name), resolve(out, name), { recursive: true });
await writeFile(resolve(out, '.nojekyll'), '');
console.log(`Build ready: ${target}/ — no dependencies or external services required.`);

