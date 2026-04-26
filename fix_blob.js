const fs = require('fs');
const path = require('path');

// Fix payment proof route for private blob
let dir = 'src/app/api/bookings';
let files = fs.readdirSync(dir);
let idDir = null;
for (let f of files) {
  if (f.startsWith('[')) { idDir = path.join(dir, f); break; }
}
if (!idDir) { console.log('ERROR: Could not find [id] dir'); process.exit(1); }

let payDir = path.join(idDir, 'payment');
let routePath = path.join(payDir, 'route.ts');
console.log('Route path:', routePath);

let f = fs.readFileSync(routePath, 'utf8');
console.log('File length:', f.length);

// Replace public access with no access option (private is default)
f = f.replace(/\{ access: 'public' \}/g, '');
// Clean up empty trailing comma
f = f.replace('put(filename, imageFile, )', 'put(filename, imageFile)');

fs.writeFileSync(routePath, f, 'utf8');
console.log('FIXED: Removed public access option from blob put()');

// Show the fixed put() call
let lines = f.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('put(')) {
    console.log('Line ' + (i+1) + ': ' + lines[i].trim());
  }
}