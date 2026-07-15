import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

async function removeBlackBackground(file) {
  const input = join(process.cwd(), "public", file);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 40;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r <= threshold && g <= threshold && b <= threshold) {
      data[i + 3] = 0;
    }
  }

  const output = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  writeFileSync(input, output);
  console.log(`Processed ${file}`);
}

await removeBlackBackground("babyido-symbol.png");
await removeBlackBackground("babyido-wordmark.png");
