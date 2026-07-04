const fs = require('fs');

const html = fs.readFileSync('drive_root.html', 'utf8');

// The pattern is usually: "ID",["PARENT_ID"],"NAME","application/vnd.google-apps.folder"
// Google Drive HTML uses hex sequences like \x22 for double quotes, \x5b for [, \x5d for ]
// Let's normalize these first to make pattern matching trivial!
let cleanHtml = html
  .replace(/\\x22/g, '"')
  .replace(/\\x5b/g, '[')
  .replace(/\\x5d/g, ']')
  .replace(/\\x2f/g, '/');

// Find all occurrences of folders: ["ID", ["PARENT_ID"], "NAME", "application/vnd.google-apps.folder"
// Let's write a regex that matches this structure:
// "[ID]",["[PARENT_ID]"],"[NAME]","application/vnd.google-apps.folder"
const folderRegex = /"([a-zA-Z0-9_-]{25,45})"\s*,\s*\[\s*"([a-zA-Z0-9_-]{25,45})"\s*\]\s*,\s*"([^"]+)"\s*,\s*"application\/vnd\.google-apps\.folder"/g;

const folders = [];
let match;
while ((match = folderRegex.exec(cleanHtml)) !== null) {
  folders.push({
    id: match[1],
    parentId: match[2],
    name: match[3]
  });
}

console.log('Extracted Folders:', folders);
fs.writeFileSync('folders.json', JSON.stringify(folders, null, 2));
