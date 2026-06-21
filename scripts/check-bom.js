const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'firestore.indexes.json',
  'firestore.rules',
  'firebase.json',
  'package.json'
];

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filePath)) {
    return;
  }

  try {
    const buffer = fs.readFileSync(filePath);

    // Check for UTF-8 BOM: 0xEF, 0xBB, 0xBF
    if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      const cleanContent = buffer.slice(3);
      fs.writeFileSync(filePath, cleanContent);
      console.log(`[BOM Check] Fixed: ${file} (stripped UTF-8 BOM)`);
    } else {
      console.log(`[BOM Check] clean: ${file}`);
    }
  } catch (err) {
    console.error(`[BOM Check] Error processing ${file}: ${err.message}`);
  }
});

process.exit(0);
