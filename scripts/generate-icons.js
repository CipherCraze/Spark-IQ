import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceIcon = path.join(process.cwd(), 'public', 'myfavicon2.png');
const outputDir = path.join(process.cwd(), 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate icons
async function generateIcons() {
  try {
    // Generate 192x192 icon
    await sharp(sourceIcon)
      .resize(192, 192)
      .png() // Convert to PNG format
      .toFile(path.join(outputDir, 'icon-192x192.png'));

    // Generate 512x512 icon
    await sharp(sourceIcon)
      .resize(512, 512)
      .png() // Convert to PNG format
      .toFile(path.join(outputDir, 'icon-512x512.png'));

    console.log('PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    if (error.code === 'ENOENT') {
      console.error('Source icon file not found. Please make sure myfavicon2.png exists in the public directory.');
    }
  }
}

generateIcons(); 