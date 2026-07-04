const fs = require('fs');
const { execSync } = require('child_process');

const folderMap = JSON.parse(fs.readFileSync('folder_mapping.json', 'utf8'));

console.log('Testing each folder map to extract file listings...');

const finalFileMapping = {};

for (const [sys, id] of Object.entries(folderMap)) {
  console.log(`\n=== Processing System: ${sys} (Folder ID: ${id}) ===`);
  const filename = `drive_${sys}.html`;
  
  try {
    // Download folder HTML
    execSync(`curl -L "https://drive.google.com/drive/folders/${id}" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -o ${filename}`);
    
    const html = fs.readFileSync(filename, 'utf8');
    const cleanHtml = html
      .replace(/\\x22/g, '"')
      .replace(/\\x5b/g, '[')
      .replace(/\\x5d/g, ']')
      .replace(/\\x2f/g, '/')
      .replace(/\\x3d/g, '=')
      .replace(/\\x2c/g, ',')
      .replace(/\\x3a/g, ':');
    
    // Find all potential files inside this folder
    // For files, Google Drive often serializes them like:
    // [ "FILE_ID", ["FOLDER_ID"], "FILE_NAME", "mimeType", ... ]
    // Let's write a regex that matches: "[ID]",["[FOLDER_ID]"],"[FILE_NAME]","[MIME_TYPE]"
    // File mimeTypes are usually things like "application/zip", "application/octet-stream", "application/x-zip-compressed", etc.
    // Or we can just find any quoted string with typical ROM extensions: .nes, .snes, .smc, .sfc, .gba, .gbc, .gb, .zip, .md, .bin, .n64, .z64
    // Let's search for any occurrence of a ROM file name and trace back to its ID
    const fileMatches = [];
    const idRegex = /"([a-zA-Z0-9_-]{33})"\s*,\s*\[\s*"([a-zA-Z0-9_-]{33})"\s*\]\s*,\s*"([^"]+)"/g;
    
    let match;
    while ((match = idRegex.exec(cleanHtml)) !== null) {
      const fileId = match[1];
      const parentId = match[2];
      const name = match[3];
      
      // Filter out if the name has typical retro extensions or if it's zipped
      const lowerName = name.toLowerCase();
      if (
        lowerName.endsWith('.nes') || 
        lowerName.endsWith('.sfc') || 
        lowerName.endsWith('.smc') || 
        lowerName.endsWith('.gba') || 
        lowerName.endsWith('.gbc') || 
        lowerName.endsWith('.gb') || 
        lowerName.endsWith('.zip') || 
        lowerName.endsWith('.md') || 
        lowerName.endsWith('.bin') || 
        lowerName.endsWith('.n64') || 
        lowerName.endsWith('.z64')
      ) {
        fileMatches.push({ id: fileId, name: name });
      }
    }
    
    console.log(`Found ${fileMatches.length} matching ROM files in ${sys}:`);
    fileMatches.forEach(f => {
      console.log(`  - ${f.name} -> ID: ${f.id}`);
    });
    
    finalFileMapping[sys] = fileMatches;
    
  } catch (error) {
    console.error(`Error processing ${sys}:`, error.message);
  }
}

fs.writeFileSync('roms_drive_mapping.json', JSON.stringify(finalFileMapping, null, 2));
console.log('\nSaved roms_drive_mapping.json!');
