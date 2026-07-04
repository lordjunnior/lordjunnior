const fs = require('fs');

const html = fs.readFileSync('drive_root.html', 'utf8');

// Search for anything containing "application/vnd.google-apps.folder" or "vnd.google-apps.folder"
// Let's replace hex escapes to make it easier to search
const cleanHtml = html
  .replace(/\\x22/g, '"')
  .replace(/\\x5b/g, '[')
  .replace(/\\x5d/g, ']')
  .replace(/\\x2f/g, '/')
  .replace(/\\x3d/g, '=');

// Let's find index of any "application/vnd.google-apps.folder"
let index = 0;
const folders = [];

while (true) {
  index = cleanHtml.indexOf('application/vnd.google-apps.folder', index);
  if (index === -1) break;

  // Let's print a chunk around this index to understand how it looks
  const chunk = cleanHtml.substring(Math.max(0, index - 200), index + 100);
  console.log('--- FOLDER OCCURRENCE ---');
  console.log(chunk);

  // Let's try to extract ID and NAME from the chunk
  // Usually the structure is: ["ID", ["PARENT"], "NAME", "application/vnd.google-apps.folder", ...]
  // We can look backward from "application/vnd.google-apps.folder"
  const preChunk = cleanHtml.substring(Math.max(0, index - 250), index);
  // Match structure: ["ID",["PARENT"],"NAME",
  // Let's extract all quoted strings in this preChunk
  const quoteRegex = /"([^"]+)"/g;
  const matches = [];
  let m;
  while ((m = quoteRegex.exec(preChunk)) !== null) {
    matches.push(m[1]);
  }
  
  if (matches.length >= 3) {
    // The last few matched strings before "application/vnd.google-apps.folder" are likely Name, Parent ID, ID
    // Let's inspect them
    const name = matches[matches.length - 1];
    const parentId = matches[matches.length - 2];
    const id = matches[matches.length - 3];
    console.log(`Potential Match: ID=${id}, Parent=${parentId}, Name=${name}`);
    folders.push({ id, parentId, name });
  }

  index += 'application/vnd.google-apps.folder'.length;
}

console.log('Total extracted folders:', folders.length);
fs.writeFileSync('folders.json', JSON.stringify(folders, null, 2));
