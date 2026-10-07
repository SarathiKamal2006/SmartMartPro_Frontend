const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function readZipEntries(buf) {
  let offset = 0;
  const entries = [];
  while (offset < buf.length - 30) {
    const sig = buf.readUInt32LE(offset);
    if (sig === 0x04034b50) {
      const compMethod = buf.readUInt16LE(offset + 8);
      const compSize = buf.readUInt32LE(offset + 18);
      const uncompSize = buf.readUInt32LE(offset + 22);
      const fileNameLen = buf.readUInt16LE(offset + 26);
      const extraLen = buf.readUInt16LE(offset + 28);
      const fileName = buf.toString('utf8', offset + 30, offset + 30 + fileNameLen);
      const dataOffset = offset + 30 + fileNameLen + extraLen;
      const data = buf.slice(dataOffset, dataOffset + compSize);
      entries.push({ fileName, compSize, uncompSize, compMethod, dataOffset, data });
      offset = dataOffset + compSize;
    } else {
      offset++;
    }
  }
  return entries;
}

const docxPath = path.join(__dirname, 'sample-report', 'Store_Management_System_Report_Revised.docx');
const buf = fs.readFileSync(docxPath);
const entries = readZipEntries(buf);

// Extract word/document.xml
const docEntry = entries.find(e => e.fileName === 'word/document.xml');
if (docEntry) {
  let content;
  if (docEntry.compMethod === 8) {
    content = zlib.inflateRawSync(docEntry.data);
  } else {
    content = docEntry.data;
  }
  const xml = content.toString('utf8');
  // Extract text from XML - remove tags and get text
  const text = xml
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<w:p[ >]/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x[0-9A-Fa-f]+;/g, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
  
  fs.writeFileSync('docx_content.txt', text, 'utf8');
  console.log('Extracted! First 3000 chars:');
  console.log(text.substring(0, 3000));
} else {
  console.log('document.xml not found. Files:', entries.map(e => e.fileName));
}

// Also list image files
const images = entries.filter(e => e.fileName.match(/\.(png|jpg|jpeg|gif|emf|wmf)/i));
console.log('\nImages in docx:', images.map(e => e.fileName));
