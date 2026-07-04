const fs = require('fs');

const html = fs.readFileSync('drive_root.html', 'utf8');

const cleanHtml = html
  .replace(/\\x22/g, '"')
  .replace(/\\x5b/g, '[')
  .replace(/\\x5d/g, ']')
  .replace(/\\x2f/g, '/')
  .replace(/\\x3d/g, '=')
  .replace(/\\x2c/g, ',')
  .replace(/\\x3a/g, ':');

// We want to find folders mapping: name -> id
// Let's search for exact occurrences of foldernames in quotes: e.g. "nes", "snes", "gbc", "gb", "gba", "genesis", "sms", "n64", "atari"
const systemNames = ['nes', 'snes', 'gbc', 'gb', 'gba', 'genesis', 'sms', 'n64', 'atari', 'atari2600', 'megadrive', 'gamegear'];
const folderMap = {};

systemNames.forEach(sys => {
  // Let's search for "sys" as a folder name
  // Google Drive serializes folder data inside arrays, often like: [ "ID", ["PARENT_ID"], "NAME", "application/vnd.google-apps.folder", ... ]
  // Or: [ ... [ "NAME", null, 1 ] ... ]
  // Let's search for the index of the string `"${sys}"` in cleanHtml
  let index = 0;
  while (true) {
    index = cleanHtml.indexOf(`"${sys}"`, index);
    if (index === -1) break;

    // Look for a Google Drive ID nearby (usually 33 chars, [a-zA-Z0-9_-]{33})
    // Let's scan a region of 1000 characters before and after this index
    const region = cleanHtml.substring(Math.max(0, index - 500), Math.min(cleanHtml.length, index + 500));
    const driveIdRegex = /"([a-zA-Z0-9_-]{33})"/g;
    let match;
    while ((match = driveIdRegex.exec(region)) !== null) {
      const foundId = match[1];
      // Skip the folder ID of the root directory itself to avoid false matching
      if (foundId !== '1CtaPzffLSe2Icq8Ol55Mzj_71RF9_Y2b') {
        // Let's verify that this ID is indeed mapped near "application/vnd.google-apps.folder"
        if (region.includes('application/vnd.google-apps.folder')) {
          folderMap[sys] = foundId;
          break;
        }
      }
    }
    if (folderMap[sys]) break;
    index += sys.length + 2;
  }
});

// Let's print the result
console.log('Folder mapping found:');
console.log(JSON.stringify(folderMap, null, 2));
fs.writeFileSync('folder_mapping.json', JSON.stringify(folderMap, null, 2));
