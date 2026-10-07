import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Auto-sync generated product images to public/products
const brainDir = 'C:/Users/sarat/.gemini/antigravity-ide/brain/3fc5a59a-2f99-4f0b-9a42-b62dd25c66f2';
const targetDir = path.resolve(__dirname, 'public/products');
if (fs.existsSync(brainDir)) {
  const imageMap = {
    'cadbury_crispello_trio_1791040393179.jpg': 'cadbury_dairy_milk_crispello.jpg',
    'cadbury_fuse_bar_1791040450055.jpg': 'cadbury_fuse_bar.jpg',
    'cadbury_perk_extra_1791040655551.jpg': 'cadbury_perk_extra.jpg',
    'kinder_joy_boys_1791040273211.jpg': 'kinder_joy_boys.jpg',
    'lotte_caramilk_stick_1791040414975.jpg': 'lotte_caramilk_stick.jpg',
    'lotte_coconut_punch_1791040477498.jpg': 'lotte_coconut_punch.jpg',
    'milkybar_choo_1791040622231.jpg': 'milkybar_choo.jpg',
    'milkybar_play_puzzle_1791040362148.jpg': 'milkybar_play_puzzle.jpg',
    'nestle_bar_one_1791040308906.jpg': 'nestle_bar_one.jpg',
    'nestle_polo_roll_1791040584249.jpg': 'nestle_polo_roll.jpg',
    'polo_mint_hole_1791040328010.jpg': 'polo_mint_hole.jpg',
    'snickers_bar_1791040245296.jpg': 'snickers_chocolate_bar.jpg'
  };

  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    for (const [srcFile, destFile] of Object.entries(imageMap)) {
      const srcPath = path.join(brainDir, srcFile);
      const destPath = path.join(targetDir, destFile);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
    console.log('✅ Synchronized all chocolate product images to public/products');

    // Sync SmartMart Pro Official Logo
    const logoSrc = path.join(brainDir, '.user_uploaded/media_1791118183787.png');
    const logoDest = path.resolve(__dirname, 'public/smartmart_logo.png');
    if (fs.existsSync(logoSrc)) {
      fs.copyFileSync(logoSrc, logoDest);
      fs.copyFileSync(logoSrc, path.resolve(__dirname, 'public/smartmart_logo.jpg'));
      console.log('✅ Synced user official SmartMart Pro logo to public/smartmart_logo.png and .jpg');
    }

    // Sync banner images and hero visuals
    const bannerDir = path.resolve(__dirname, 'public/banners');
    if (!fs.existsSync(bannerDir)) {
      fs.mkdirSync(bannerDir, { recursive: true });
    }
    const userUploadedDir = path.join(brainDir, '.user_uploaded');
    const bannerMap = {
      'media_1791127042721.png': 'banner_fresh_groceries_hero.png',
      'media_1791045586341.png': 'banner_vegetables.png',
      'media_1791087713532.png': 'banner_fruits.png',
      'media_1791045944575.png': 'banner_hygiene.png',
      'media_1791045648393.png': 'banner_chocolates.png'
    };
    const meta = {};
    for (const [srcFile, destFile] of Object.entries(bannerMap)) {
      const srcPath = path.join(userUploadedDir, srcFile);
      const destPath = path.join(bannerDir, destFile);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        const buf = fs.readFileSync(srcPath);
        const w = buf.readUInt32BE(16);
        const h = buf.readUInt32BE(20);
        meta[destFile] = { width: w, height: h, aspectRatio: (w / h).toFixed(2) };
        console.log(`✅ Synced banner: ${destFile} (${w}x${h})`);
      }
    }

    // Sync high-definition isolated hero visuals
    const heroVisualMap = {
      'fresh_produce_basket_hd_1791127978409.jpg': 'fresh_produce_basket.jpg',
      'hero_vegetables_basket_1791088435883.jpg': 'hero_vegetables.jpg',
      'hero_fruits_basket_1791088459848.jpg': 'hero_fruits.jpg',
      'hero_hygiene_bottles_1791088486531.jpg': 'hero_hygiene.jpg',
      'hero_chocolates_basket_1791088513104.jpg': 'hero_chocolates.jpg'
    };
    const hdHeroSrc = path.join(brainDir, 'fresh_produce_basket_hd_1791127978409.jpg');
    if (fs.existsSync(hdHeroSrc)) {
      fs.copyFileSync(hdHeroSrc, path.resolve(__dirname, 'public/dashboard_grocery_hero.jpg'));
    }
    for (const [srcFile, destFile] of Object.entries(heroVisualMap)) {
      const srcPath = path.join(brainDir, srcFile);
      const destPath = path.join(bannerDir, destFile);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Synced hero visual: ${destFile}`);
      }
    }
    fs.writeFileSync(path.join(bannerDir, 'meta.json'), JSON.stringify(meta, null, 2));
  } catch (err) {
    console.error('Error copying images:', err);
  }
}

// Extract and parse sample report docx
try {
  const zlib = await import('zlib');
  const sampleDocxPath = path.resolve(__dirname, '../sample-report/Store_Management_System_Report_Revised.docx');
  if (fs.existsSync(sampleDocxPath)) {
    const buf = fs.readFileSync(sampleDocxPath);
    let offset = 0;
    let docXml = '';
    let stylesXml = '';
    const extractedMedia = [];

    while (offset < buf.length - 30) {
      const sig = buf.readUInt32LE(offset);
      if (sig === 0x04034b50) {
        const compMethod = buf.readUInt16LE(offset + 8);
        const compSize = buf.readUInt32LE(offset + 18);
        const fileNameLen = buf.readUInt16LE(offset + 26);
        const extraLen = buf.readUInt16LE(offset + 28);
        const fileName = buf.toString('utf8', offset + 30, offset + 30 + fileNameLen);
        const dataOffset = offset + 30 + fileNameLen + extraLen;
        const compData = buf.subarray(dataOffset, dataOffset + compSize);

        if (fileName === 'word/document.xml') {
          docXml = compMethod === 8 ? zlib.inflateRawSync(compData).toString('utf8') : compData.toString('utf8');
        } else if (fileName === 'word/styles.xml') {
          stylesXml = compMethod === 8 ? zlib.inflateRawSync(compData).toString('utf8') : compData.toString('utf8');
        } else if (fileName.startsWith('word/media/')) {
          const mediaDir = path.resolve(__dirname, '../sample-report/media');
          if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
          const imgBuf = compMethod === 8 ? zlib.inflateRawSync(compData) : compData;
          fs.writeFileSync(path.join(mediaDir, path.basename(fileName)), imgBuf);
          extractedMedia.push(path.basename(fileName));
        }
        offset = dataOffset + compSize;
      } else {
        offset++;
      }
    }

    if (docXml) {
      fs.writeFileSync(path.resolve(__dirname, '../sample_report_document.xml'), docXml, 'utf8');
      const text = docXml.replace(/<w:p[^>]*>/g, '\n')
                         .replace(/<w:tr[^>]*>/g, '\n[ROW] ')
                         .replace(/<w:tc[^>]*>/g, ' | ')
                         .replace(/<[^>]+>/g, '')
                         .replace(/&amp;/g, '&')
                         .replace(/&lt;/g, '<')
                         .replace(/&gt;/g, '>')
                         .replace(/&quot;/g, '"')
                         .replace(/&apos;/g, "'")
                         .replace(/\n\s*\n+/g, '\n');
      fs.writeFileSync(path.resolve(__dirname, '../sample_report_text.txt'), text, 'utf8');
      console.log('✅ Extracted sample report text (' + text.length + ' chars) and ' + extractedMedia.length + ' images!');
    }
    if (stylesXml) {
      fs.writeFileSync(path.resolve(__dirname, '../sample_report_styles.xml'), stylesXml, 'utf8');
    }
  }
} catch (e) {
  console.warn('Docx extraction note:', e.message);
}

// Generate the SmartMart Pro Project Report docx
try {
  const { execSync } = await import('child_process');
  const genScript = path.resolve(__dirname, '../generate_smartmart_report.js');
  if (fs.existsSync(genScript)) {
    console.log('🚀 Triggering SmartMart Pro report docx generator...');
    const result = execSync(`node "${genScript}"`, { encoding: 'utf8' });
    console.log(result);

    const exactScript = path.resolve(__dirname, '../build_exact_smartmart_report.js');
    if (fs.existsSync(exactScript)) {
      const eResult = execSync(`node "${exactScript}"`, { encoding: 'utf8' });
      console.log(eResult);
    }
  }
} catch (genErr) {
  console.error('Report generation error:', genErr.message);
}

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: ['..', 'C:/Users/sarat/.gemini/antigravity-ide/brain/3fc5a59a-2f99-4f0b-9a42-b62dd25c66f2']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
