const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = path.join(process.cwd(), 'public', 'sstlogo.png');
const targetDir = path.join(process.cwd(), 'public', 'icons');

// Apple splash screen sizes
const splashScreens = [
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.jpg' }, // 12.9" iPad Pro
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388.jpg' }, // 11" iPad Pro
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048.jpg' }, // 9.7" iPad
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.jpg' }, // iPhone X/XS
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688.jpg' }, // iPhone XS Max
];

// Apple icon sizes
const appleIconSizes = [180];

async function generateIcons() {
  try {
    // Create icons directory if it doesn't exist
    await fs.mkdir(targetDir, { recursive: true });

    // Generate standard PWA icons
    for (const size of sizes) {
      await sharp(sourceIcon)
        .resize(size, size)
        .toFile(path.join(targetDir, `icon-${size}x${size}.png`));
      console.log(`Generated ${size}x${size} icon`);
    }

    // Generate Apple icons
    for (const size of appleIconSizes) {
      await sharp(sourceIcon)
        .resize(size, size)
        .toFile(path.join(targetDir, `apple-icon-${size}.png`));
      console.log(`Generated ${size}x${size} Apple icon`);
    }

    // Generate splash screens
    for (const screen of splashScreens) {
      const iconSize = Math.floor(Math.min(screen.width, screen.height) * 0.4);
      await sharp(sourceIcon)
        .resize(iconSize, iconSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .extend({
          top: Math.floor((screen.height - iconSize) / 2),
          bottom: Math.floor((screen.height - iconSize) / 2),
          left: Math.floor((screen.width - iconSize) / 2),
          right: Math.floor((screen.width - iconSize) / 2),
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .jpeg({
          quality: 90
        })
        .toFile(path.join(targetDir, screen.name));
      console.log(`Generated splash screen: ${screen.name}`);
    }

    console.log('All PWA assets generated successfully!');
  } catch (error) {
    console.error('Error generating PWA assets:', error);
  }
}

generateIcons();
