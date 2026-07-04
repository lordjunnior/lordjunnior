const fs = require('fs');
const { execSync } = require('child_process');

console.log('--- STARTING COMPREHENSIVE SCAN ---');

// 1. Load root folder HTML (or redownload if needed, but we already have drive_root.html)
const rootHtml = fs.readFileSync('drive_root.html', 'utf8');

// Normalize characters
const cleanRootHtml = rootHtml
  .replace(/\\x22/g, '"')
  .replace(/\\x5b/g, '[')
  .replace(/\\x5d/g, ']')
  .replace(/\\x2f/g, '/')
  .replace(/\\x3d/g, '=')
  .replace(/\\x2c/g, ',')
  .replace(/\\x3a/g, ':');

// We want to find folders mapping: name -> id
// Google Drive initial HTML lists subfolders under the current directory.
// Let's use a regex to match: [ "ID", ["PARENT_ID"], "NAME", "application/vnd.google-apps.folder" ]
// Some names might have spaces, uppercase letters, etc.
// Let's search for matches of IDs that are 33 characters long and have the folder mimeType
const subfolders = [];
const folderRegex = /"([a-zA-Z0-9_-]{33})"\s*,\s*\[\s*"([a-zA-Z0-9_-]{33})"\s*\]\s*,\s*"([^"]+)"\s*,\s*"application\/vnd\.google-apps\.folder"/g;

let match;
while ((match = folderRegex.exec(cleanRootHtml)) !== null) {
  const id = match[1];
  const parentId = match[2];
  const name = match[3];
  
  if (parentId === '1CtaPzffLSe2Icq8Ol55Mzj_71RF9_Y2b') {
    subfolders.push({ id, name });
  }
}

console.log(`Found ${subfolders.length} direct subfolders in the Google Drive root:`);
console.log(JSON.stringify(subfolders, null, 2));

// In case the parentId regex didn't catch all or had different indentation,
// let's do a broader scan for folders
if (subfolders.length === 0) {
  console.log('Using broader fallback folder scanner...');
  // We'll search for any "application/vnd.google-apps.folder" and extract the folder name and ID
  let index = 0;
  const seenIds = new Set();
  while (true) {
    index = cleanRootHtml.indexOf('application/vnd.google-apps.folder', index);
    if (index === -1) break;
    
    // Look backward up to 300 characters
    const preChunk = cleanRootHtml.substring(Math.max(0, index - 300), index);
    // Find all IDs (33 chars) and strings
    const idMatches = preChunk.match(/"([a-zA-Z0-9_-]{33})"/g) || [];
    const nameMatches = preChunk.match(/"([^"]+)"/g) || [];
    
    if (idMatches.length > 0 && nameMatches.length > 0) {
      // Find the name (usually the one that doesn't look like a long random ID, or near the end)
      const cleanIds = idMatches.map(x => x.replace(/"/g, ''));
      const cleanNames = nameMatches.map(x => x.replace(/"/g, ''));
      
      const potentialId = cleanIds.find(x => x !== '1CtaPzffLSe2Icq8Ol55Mzj_71RF9_Y2b' && x.length === 33);
      // Name is usually the string before the mime type
      const potentialName = cleanNames[cleanNames.length - 1];
      
      if (potentialId && potentialName && !seenIds.has(potentialId) && potentialName !== 'application/vnd.google-apps.folder') {
        subfolders.push({ id: potentialId, name: potentialName });
        seenIds.add(potentialId);
      }
    }
    index += 'application/vnd.google-apps.folder'.length;
  }
  console.log(`Fallback scan found ${subfolders.length} subfolders:`);
  console.log(JSON.stringify(subfolders, null, 2));
}

// 2. Download and scan each subfolder for files
const romMap = {};

for (const folder of subfolders) {
  const normName = folder.name.toLowerCase().trim();
  console.log(`\nScanning subfolder "${folder.name}" (ID: ${folder.id}) for system "${normName}"...`);
  
  const tempFilename = `temp_${normName}.html`;
  try {
    execSync(`curl -L "https://drive.google.com/drive/folders/${folder.id}" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -o ${tempFilename}`);
    
    const folderHtml = fs.readFileSync(tempFilename, 'utf8');
    const cleanFolderHtml = folderHtml
      .replace(/\\x22/g, '"')
      .replace(/\\x5b/g, '[')
      .replace(/\\x5d/g, ']')
      .replace(/\\x2f/g, '/')
      .replace(/\\x3d/g, '=')
      .replace(/\\x2c/g, ',')
      .replace(/\\x3a/g, ':');
    
    // Find files in this folder
    const files = [];
    // Pattern for files: [ "FILE_ID", ["FOLDER_ID"], "FILE_NAME" ]
    // Let's write a flexible regex to extract file ID and Name
    const fileRegex = /"([a-zA-Z0-9_-]{33})"\s*,\s*\[\s*"([a-zA-Z0-9_-]{33})"\s*\]\s*,\s*"([^"]+)"/g;
    let fileMatch;
    const seenFiles = new Set();
    
    while ((fileMatch = fileRegex.exec(cleanFolderHtml)) !== null) {
      const fileId = fileMatch[1];
      const parentId = fileMatch[2];
      const name = fileMatch[3];
      
      if (parentId === folder.id && !seenFiles.has(fileId)) {
        // Let's clean the name (unscape slashes or quotes if any)
        const cleanName = name
          .replace(/\\u0027/g, "'")
          .replace(/\\u0026/g, "&")
          .replace(/\\x27/g, "'")
          .replace(/\\x26/g, "&")
          .trim();
        
        // Accept typical retro files or zip archives
        const lowerName = cleanName.toLowerCase();
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
          lowerName.endsWith('.z64') ||
          lowerName.endsWith('.sms') ||
          lowerName.endsWith('.gg')
        ) {
          files.push({ id: fileId, name: cleanName });
          seenFiles.add(fileId);
        }
      }
    }
    
    console.log(`-> Found ${files.length} ROM files in folder "${folder.name}"`);
    romMap[normName] = files;
    
  } catch (err) {
    console.error(`Error scanning subfolder "${folder.name}":`, err.message);
  }
}

// Save the complete output
fs.writeFileSync('complete_rom_mapping.json', JSON.stringify(romMap, null, 2));
console.log('\n--- COMPREHENSIVE SCAN COMPLETED! Saved to complete_rom_mapping.json ---');
