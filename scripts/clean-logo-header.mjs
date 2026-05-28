import sharp from "sharp";
import fs from "fs";

const input = "public/branding/logo-header.png";
const backup = "public/branding/logo-header-original.png";
const output = "public/branding/logo-header.png";

if (!fs.existsSync(input)) {
  console.error("Arquivo não encontrado:", input);
  process.exit(1);
}

if (!fs.existsSync(backup)) {
  fs.copyFileSync(input, backup);
  console.log("Backup criado em:", backup);
}

const image = sharp(input).ensureAlpha();
const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += info.channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];

  const isAlmostWhite = r > 220 && g > 220 && b > 220;
  const isLightGray = r > 200 && g > 200 && b > 200 && Math.abs(r - g) < 12 && Math.abs(g - b) < 12;

  if (isAlmostWhite || isLightGray) {
    data[i + 3] = 0;
  }
}

await sharp(data, {
  raw: {
    width: info.width,
    height: info.height,
    channels: info.channels,
  },
})
  .png()
  .toFile("public/branding/logo-header-clean.png");

fs.copyFileSync("public/branding/logo-header-clean.png", output);

console.log("Logo limpa gerada com sucesso:", output);
