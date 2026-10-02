import { Buffer } from 'node:buffer';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';

import sharp from 'sharp';

const [, , inputArgument, outputArgument] = process.argv;

if (!inputArgument || !outputArgument) {
  throw new Error('Uso: node scripts/normalize-player-spritesheet.mjs <entrada.png> <saida.webp>');
}

const inputPath = resolve(inputArgument);
const outputPath = resolve(outputArgument);
const columns = 4;
const rows = 4;
const alphaThreshold = 32;
const scaleReferenceFrame = 11;
const scaleCorrectedFrames = new Set([12, 13, 14]);
const scaleCorrectionMultiplier = 1.12;

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const pixelCount = info.width * info.height;
const visited = new Uint8Array(pixelCount);
const queue = new Int32Array(pixelCount);
const components = [];
const isOpaque = (index) => data[index * info.channels + 3] > alphaThreshold;

for (let seed = 0; seed < pixelCount; seed += 1) {
  if (visited[seed] || !isOpaque(seed)) continue;

  let read = 0;
  let write = 1;
  let area = 0;
  let minimumX = info.width;
  let minimumY = info.height;
  let maximumX = 0;
  let maximumY = 0;
  queue[0] = seed;
  visited[seed] = 1;

  while (read < write) {
    const index = queue[read];
    read += 1;
    const x = index % info.width;
    const y = Math.floor(index / info.width);
    area += 1;
    minimumX = Math.min(minimumX, x);
    minimumY = Math.min(minimumY, y);
    maximumX = Math.max(maximumX, x);
    maximumY = Math.max(maximumY, y);

    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        if (offsetX === 0 && offsetY === 0) continue;
        const nextX = x + offsetX;
        const nextY = y + offsetY;
        if (nextX < 0 || nextX >= info.width || nextY < 0 || nextY >= info.height) continue;
        const next = nextY * info.width + nextX;
        if (visited[next] || !isOpaque(next)) continue;
        visited[next] = 1;
        queue[write] = next;
        write += 1;
      }
    }
  }

  if (area > 1_000) {
    components.push({
      left: minimumX,
      top: minimumY,
      width: maximumX - minimumX + 1,
      height: maximumY - minimumY + 1,
      area,
      centerY: (minimumY + maximumY) / 2,
      pixels: queue.slice(0, write),
    });
  }
}

if (components.length !== columns * rows) {
  throw new Error(
    `Esperadas ${columns * rows} poses conectadas, mas foram encontradas ${components.length}.`,
  );
}

components.sort((first, second) => first.centerY - second.centerY);
const frames = [];
for (let row = 0; row < rows; row += 1) {
  frames.push(
    ...components
      .slice(row * columns, (row + 1) * columns)
      .sort((first, second) => first.left - second.left),
  );
}

const referenceFrame = frames[scaleReferenceFrame];
const referenceExtent = Math.max(referenceFrame.width, referenceFrame.height);
const preparedFrames = frames.map((frame, index) => {
  const sourceExtent = Math.max(frame.width, frame.height);
  const scale = scaleCorrectedFrames.has(index)
    ? (referenceExtent * scaleCorrectionMultiplier) / sourceExtent
    : 1;

  return {
    ...frame,
    scale,
    outputWidth: Math.round(frame.width * scale),
    outputHeight: Math.round(frame.height * scale),
  };
});
const frameWidth = Math.max(...preparedFrames.map((frame) => frame.outputWidth));
const frameHeight = Math.max(...preparedFrames.map((frame) => frame.outputHeight));
const composites = await Promise.all(
  preparedFrames.map(async (frame, index) => {
    const mask = Buffer.alloc(frame.width * frame.height * 4);
    for (const sourceIndex of frame.pixels) {
      const sourceX = sourceIndex % info.width;
      const sourceY = Math.floor(sourceIndex / info.width);
      const targetIndex = ((sourceY - frame.top) * frame.width + sourceX - frame.left) * 4;
      mask.fill(255, targetIndex, targetIndex + 4);
    }

    const maskPng = await sharp(mask, {
      raw: { width: frame.width, height: frame.height, channels: 4 },
    })
      .png()
      .toBuffer();
    const isolated = await sharp(inputPath)
      .extract({ left: frame.left, top: frame.top, width: frame.width, height: frame.height })
      .composite([{ input: maskPng, blend: 'dest-in' }])
      .ensureAlpha()
      .raw()
      .toBuffer();

    for (let offset = 0; offset < isolated.length; offset += 4) {
      if (isolated[offset + 3] !== 0) continue;
      isolated.fill(0, offset, offset + 3);
    }

    return {
      input: await sharp(isolated, {
        raw: { width: frame.width, height: frame.height, channels: 4 },
      })
        .resize(frame.outputWidth, frame.outputHeight, { fit: 'fill' })
        .png()
        .toBuffer(),
      left: index * frameWidth + Math.floor((frameWidth - frame.outputWidth) / 2),
      top: frameHeight - frame.outputHeight,
    };
  }),
);

await mkdir(dirname(outputPath), { recursive: true });
await sharp({
  create: {
    width: frameWidth * frames.length,
    height: frameHeight,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(composites)
  .webp({ lossless: true, effort: 6 })
  .toFile(outputPath);

process.stdout.write(
  JSON.stringify(
    {
      source: { width: info.width, height: info.height },
      frames: frames.length,
      frameWidth,
      frameHeight,
      output: outputPath,
      bounds: preparedFrames.map((frame) => ({
        left: frame.left,
        top: frame.top,
        width: frame.width,
        height: frame.height,
        scale: Number(frame.scale.toFixed(3)),
        outputWidth: frame.outputWidth,
        outputHeight: frame.outputHeight,
      })),
    },
    null,
    2,
  ) + '\n',
);
