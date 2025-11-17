/**
 * Quick script to verify OKLCH is removed from your CSS build
 * Run: node check-oklch.js
 */

const fs = require('fs');
const path = require('path');

// Common CSS output locations
const cssPaths = [
  path.join(__dirname, 'dist', 'index.css'),
  path.join(__dirname, 'dist', 'assets', 'index.css'),
  path.join(__dirname, 'src', 'index.css'),
];

console.log('🔍 Checking for OKLCH in CSS files...\n');

let foundOklch = false;

cssPaths.forEach(cssPath => {
  if (fs.existsSync(cssPath)) {
    const content = fs.readFileSync(cssPath, 'utf8');
    const oklchMatches = content.match(/oklch\([^)]+\)/g);
    
    if (oklchMatches && oklchMatches.length > 0) {
      console.log(`❌ Found ${oklchMatches.length} OKLCH references in: ${cssPath}`);
      console.log(`   Examples: ${oklchMatches.slice(0, 3).join(', ')}`);
      foundOklch = true;
    } else {
      console.log(`✅ No OKLCH found in: ${cssPath}`);
    }
  }
});

if (foundOklch) {
  console.log('\n⚠️  OKLCH is still present! Make sure to:');
  console.log('   1. Restart your dev server');
  console.log('   2. Rebuild Tailwind (if using a build step)');
  console.log('   3. Clear your browser cache');
  process.exit(1);
} else {
  console.log('\n✅ All clear! No OKLCH found. html2canvas should work perfectly.');
  process.exit(0);
}


