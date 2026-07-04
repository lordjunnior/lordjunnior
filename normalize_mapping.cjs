const fs = require('fs');

const data = JSON.parse(fs.readFileSync('complete_rom_mapping.json', 'utf8'));

// If there's a key named like "],null,null,null,", let's rename it to "atari"
for (const key of Object.keys(data)) {
  if (key.includes('null') || key.includes(']') || key.length > 15) {
    console.log(`Renaming key "${key}" to "atari"`);
    data['atari'] = data[key];
    delete data[key];
  }
}

// Let's print out the summary of items per system
console.log('ROMs per system in complete_rom_mapping.json:');
for (const [sys, files] of Object.entries(data)) {
  console.log(`  - ${sys}: ${files.length} files`);
}

fs.writeFileSync('complete_rom_mapping.json', JSON.stringify(data, null, 2));
console.log('Normalized complete_rom_mapping.json successfully!');
