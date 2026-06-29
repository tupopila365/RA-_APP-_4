import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'assets', 'launcher2.png');
const output = path.join(root, 'assets', 'launcher-icon.png');

const SIZE = 1024;
const ZOOM = 1.24;

const metadata = await sharp(source).metadata();
const width = metadata.width || SIZE;
const height = metadata.height || SIZE;

await sharp(source)
  .resize(Math.round(width * ZOOM), Math.round(height * ZOOM), { fit: 'fill' })
  .resize(SIZE, SIZE, { fit: 'cover', position: 'centre' })
  .png()
  .toFile(output);

console.log(`Wrote ${output} (${SIZE}x${SIZE}, zoom ${ZOOM})`);
