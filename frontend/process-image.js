import sharp from 'sharp';
import fs from 'fs';

async function processImage() {
  const inputPath = 'c:/Vendrax/uploads/logo.jpg';
  const outDir = 'c:/Vendrax/frontend/public';
  
  if (!fs.existsSync(inputPath)) {
    console.error('Logo not found at', inputPath);
    return;
  }

  console.log('Processing image...');
  
  const size = 512;
  const radius = size / 2;
  const circleSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${radius}" cy="${radius}" r="${radius}" /></svg>`
  );

  const baseImgBuffer = await sharp(inputPath).resize(size, size).png().toBuffer();
  const maskBuffer = await sharp(circleSvg).resize(size, size).png().toBuffer();
  
  const finalImgBuffer = await sharp(baseImgBuffer)
    .composite([{
      input: maskBuffer,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  await sharp(finalImgBuffer).toFile(`${outDir}/icon.png`);
  await sharp(finalImgBuffer).toFile(`${outDir}/pwa-512x512.png`);
  
  await sharp(finalImgBuffer).resize(192, 192).toFile(`${outDir}/pwa-192x192.png`);
  await sharp(finalImgBuffer).resize(180, 180).toFile(`${outDir}/apple-touch-icon.png`);
  
  console.log('Finished processing icons.');
}

processImage().catch(console.error);
