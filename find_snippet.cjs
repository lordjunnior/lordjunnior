const fs = require('fs');

const html = fs.readFileSync('drive_root.html', 'utf8');

// We want to extract JSON chunks or arrays that look like [ "ID", "Name", "mimeType", ... ]
// Let's search for arrays containing known subfolder strings like "NES" or "SNES" or "ATARI"
// Google Drive initial state often has elements like:
// [ "id", "name", "mimeType", ... ]
// Let's search for any occurrence of 'NES' or 'SNES' and grab surrounding array structure

const lines = html.split('\n');
console.log(`HTML has ${lines.length} lines`);

// Let's write a node script to search for the specific structure of items
// Many times, it's inside `window._F_state` or `bootstrap_data` or similar.
// Let's search for matches of IDs that we found earlier, specifically '13NBLooP1hiuuoZuKd4oVu8_8IY4GbcpZ', and see what's near it.

lines.forEach((line, idx) => {
  if (line.includes('13NBLooP1hiuuoZuKd4oVu8_8IY4GbcpZ')) {
    console.log(`Line ${idx} has ID '13NBLooP1hiuuoZuKd4oVu8_8IY4GbcpZ'`);
    // Print around this line (up to 200 chars)
    const index = line.indexOf('13NBLooP1hiuuoZuKd4oVu8_8IY4GbcpZ');
    console.log('Snippet:', line.substring(Math.max(0, index - 300), Math.min(line.length, index + 1000)));
  }
});
