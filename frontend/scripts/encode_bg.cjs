// This script converts the grocery background image to base64 and writes it as a JS module
// Run: node scripts/encode_bg.cjs
const fs = require('fs');
const path = require('path');

const imgPath = 'C:/Users/sarat/.gemini/antigravity-ide/brain/0405be8b-be09-4303-881c-c53983a7a143/grocery_market_bg_1788416039188.jpg';
const outPath = path.join(__dirname, '../src/assets/groceryBg.js');

const data = fs.readFileSync(imgPath);
const b64 = data.toString('base64');
const content = `const groceryBg = "data:image/jpeg;base64,${b64}";\nexport default groceryBg;\n`;

// Also write the raw image to public/
const publicPath = path.join(__dirname, '../public/grocery_bg.jpg');
fs.copyFileSync(imgPath, publicPath);
console.log('✅ Copied to public/grocery_bg.jpg');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content);
console.log('✅ Written to src/assets/groceryBg.js (' + Math.round(b64.length / 1024) + ' KB)');
