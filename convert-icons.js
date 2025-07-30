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
  
  // Konwertuj ikony w różnych rozmiarach
  const sizes = [192, 512];
  const icons = [
    { src: path.join(publicDir, 'favicon.svg'), name: 'icon' },
    { src: path.join(publicDir, 'icon-192x192.svg'), name: 'icon-192x192' },
    { src: path.join(publicDir, 'icon-512x512.svg'), name: 'icon-512x512' }
  ];

  for (const icon of icons) {
    for (const size of sizes) {
      const outputPath = path.join(publicDir, `${icon.name}-${size}.png`);
      await convertSvgToPng(icon.src, outputPath, size);
    }
  }
}

main().catch(console.error);