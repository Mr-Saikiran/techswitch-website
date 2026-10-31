// Copies the Workout Splits app into public/splits/ and adds the home badge.
//   node scripts/sync-splits.mjs [path to a workout-splits checkout]   (default ../workout-splits)
// Source: https://github.com/Mr-Saikiran/workout-splits
import { cp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(process.argv[2] || join(root, '..', 'workout-splits'));
const dest = join(root, 'public', 'splits');

await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
for (const part of ['css', 'js']) await cp(join(src, part), join(dest, part), { recursive: true });

const html = await readFile(join(src, 'index.html'), 'utf8');
if (!html.includes('</body>')) throw new Error(`${src}/index.html has no </body>`);
await writeFile(join(dest, 'index.html'), html.replace('</body>', '  <script src="/home-badge.js" defer></script>\n</body>'));

console.log(`public/splits/ ← ${src}`);
