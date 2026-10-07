const fs = require('fs');
const path = require('path');

const userDir = 'C:\\Users\\sarat\\.gemini\\antigravity-ide\\brain\\942eecb0-7081-4520-b9f7-7d499efda768\\.user_uploaded';

const files = [
  'media_1790774268187.png',
  'media_1790774280515.png',
  'media_1790774303556.png',
  'media_1790774323730.png'
];

files.forEach(f => {
  const p = path.join(userDir, f);
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    const w = data.readUInt32BE(16);
    const h = data.readUInt32BE(20);
    console.log(`${f}: ${w}x${h}`);
  } else {
    console.log(`NOT FOUND: ${f}`);
  }
});
