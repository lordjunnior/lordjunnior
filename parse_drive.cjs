const fs = require('fs');

const html = fs.readFileSync('drive_root.html', 'utf8');

// Let's search for patterns like:
// '1CtaPzffLSe2Icq8Ol55Mzj_71RF9_Y2b' or other folder/file IDs
// File IDs are usually 33 characters long and look like: [a-zA-Z0-9_-]{33}
const regex = /"([a-zA-Z0-9_-]{28,40})"/g;
let match;
const ids = new Set();
while ((match = regex.exec(html)) !== null) {
  const id = match[1];
  // Filter out typical UI strings
  if (id.includes('_') || id.includes('-')) {
    if (id.length >= 33) {
      ids.add(id);
    }
  }
}

console.log('Found potential Google Drive IDs:', Array.from(ids).slice(0, 50));

// Let's also look for strings like folders or names in the HTML, or common JSON arrays
// Google Drive initial data is often in a script tag inside window._F_state or bootstrap data
const scriptTags = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
console.log(`Found ${scriptTags.length} script tags`);

fs.writeFileSync('scripts_content.txt', '');
scriptTags.forEach((tag, idx) => {
  if (tag.includes('1CtaPzffLSe2Icq8Ol55Mzj_71RF9_Y2b') || tag.includes('NES') || tag.includes('snes') || tag.includes('Nintendo')) {
    console.log(`Script tag ${idx} has target data!`);
    fs.appendFileSync('scripts_content.txt', `\n--- SCRIPT ${idx} ---\n` + tag);
  }
});
