import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertSvgToPng(svgPath, outputPath, size) {
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Converted ${svgPath} to ${outputPath}`);
  } catch (error) {
    console.error(`Error converting ${svgPath}:`, error);
  }
}

async function main() {
  const publicDir = path.join(__dirname, 'public');
  const faviconPath = path.join(publicDir, 'favicon.svg');
  
  // Generuj ikony PNG z favicon.svg
  const sizes = [192, 512];
  
  for (const size of sizes) {
    const outputPath = path.join(publicDir, `icon-${size}.png`);
    await convertSvgToPng(faviconPath, outputPath, size);
  }
}

main().catch(console.error);