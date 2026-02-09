const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// SVG icon: Tic Tac Toe grid with X's (gold) and O's (cyan) on purple background
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Background -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="90" fill="url(#bg)"/>

  <!-- Grid lines -->
  <line x1="190" y1="100" x2="190" y2="412" stroke="rgba(255,255,255,0.5)" stroke-width="8" stroke-linecap="round"/>
  <line x1="322" y1="100" x2="322" y2="412" stroke="rgba(255,255,255,0.5)" stroke-width="8" stroke-linecap="round"/>
  <line x1="100" y1="190" x2="412" y2="190" stroke="rgba(255,255,255,0.5)" stroke-width="8" stroke-linecap="round"/>
  <line x1="100" y1="322" x2="412" y2="322" stroke="rgba(255,255,255,0.5)" stroke-width="8" stroke-linecap="round"/>

  <!-- X top-left -->
  <line x1="115" y1="115" x2="175" y2="175" stroke="#FFD54F" stroke-width="14" stroke-linecap="round"/>
  <line x1="175" y1="115" x2="115" y2="175" stroke="#FFD54F" stroke-width="14" stroke-linecap="round"/>

  <!-- O center -->
  <circle cx="256" cy="256" r="38" fill="none" stroke="#80DEEA" stroke-width="14"/>

  <!-- X bottom-right -->
  <line x1="337" y1="337" x2="397" y2="397" stroke="#FFD54F" stroke-width="14" stroke-linecap="round"/>
  <line x1="397" y1="337" x2="337" y2="397" stroke="#FFD54F" stroke-width="14" stroke-linecap="round"/>

  <!-- O top-right -->
  <circle cx="256" cy="145" r="30" fill="none" stroke="#80DEEA" stroke-width="14"/>

  <!-- X bottom-center -->
  <line x1="230" y1="340" x2="282" y2="392" stroke="#FFD54F" stroke-width="14" stroke-linecap="round"/>
  <line x1="282" y1="340" x2="230" y2="392" stroke="#FFD54F" stroke-width="14" stroke-linecap="round"/>
</svg>`;

// Foreground-only SVG (transparent bg, for adaptive icon PNGs)
const svgForeground = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108">
  <!-- Grid lines -->
  <line x1="45" y1="28" x2="45" y2="80" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <line x1="63" y1="28" x2="63" y2="80" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <line x1="28" y1="45" x2="80" y2="45" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <line x1="28" y1="63" x2="80" y2="63" stroke="white" stroke-width="3" stroke-linecap="round"/>

  <!-- X top-left -->
  <line x1="31" y1="31" x2="42" y2="42" stroke="#FFD54F" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="42" y1="31" x2="31" y2="42" stroke="#FFD54F" stroke-width="3.5" stroke-linecap="round"/>

  <!-- O center -->
  <circle cx="54" cy="54" r="5" fill="none" stroke="#80DEEA" stroke-width="3.5"/>

  <!-- X bottom-right -->
  <line x1="67" y1="67" x2="78" y2="78" stroke="#FFD54F" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="78" y1="67" x2="67" y2="78" stroke="#FFD54F" stroke-width="3.5" stroke-linecap="round"/>

  <!-- O top-right -->
  <circle cx="71.5" cy="36.5" r="5" fill="none" stroke="#80DEEA" stroke-width="3.5"/>

  <!-- X bottom-left -->
  <line x1="31" y1="67" x2="42" y2="78" stroke="#FFD54F" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="42" y1="67" x2="31" y2="78" stroke="#FFD54F" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;

const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Icon sizes for each density
const densities = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Foreground sizes (108dp scaled)
const fgDensities = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

async function generate() {
  const svgBuffer = Buffer.from(svgIcon);
  const fgBuffer = Buffer.from(svgForeground);

  for (const [folder, size] of Object.entries(densities)) {
    const dir = path.join(resDir, folder);
    
    // Main launcher icon (full icon with background)
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(dir, 'ic_launcher.png'));
    
    // Round launcher icon
    const roundSvg = svgIcon.replace('rx="90"', `rx="${Math.round(size/2)}"`);
    await sharp(Buffer.from(roundSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));
    
    console.log(`  ${folder}: ${size}x${size}px`);
  }

  // Foreground PNGs for adaptive icon
  for (const [folder, size] of Object.entries(fgDensities)) {
    const dir = path.join(resDir, folder);
    await sharp(fgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));
    console.log(`  ${folder} foreground: ${size}x${size}px`);
  }

  // Play Store 512x512 icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, 'playstore-icon-512.png'));
  console.log('  Play Store icon: 512x512px -> playstore-icon-512.png');

  console.log('\nAll icons generated!');
}

generate().catch(console.error);
