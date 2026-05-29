import sharp from "sharp";
import fs from "fs";

const input = "public/branding/logo-symbol.png";
const output = "public/branding/favicon.png";

if (!fs.existsSync(input)) {
  console.error("Arquivo não encontrado:", input);
  process.exit(1);
}

await sharp(input)
  .ensureAlpha()
  .trim({
    background: { r: 255, g: 255, b: 255, alpha: 0 },
    threshold: 20,
  })
  .resize(420, 420, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  })
  .extend({
    top: 46,
    bottom: 46,
    left: 46,
    right: 46,
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  })
  .png()
  .toFile(output);

await sharp(output)
  .resize(512, 512, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  })
  .png()
  .toFile("app/icon.png");

await sharp(output)
  .resize(512, 512, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  })
  .png()
  .toFile("app/apple-icon.png");

console.log("Favicon ajustado com sucesso.");
