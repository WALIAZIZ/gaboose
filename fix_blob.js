const fs = require('fs');
let f = fs.readFileSync('src/app/api/bookings/[id]/payment/route.ts', 'utf8');
f = f.replace(/\{ access: 'public' \}/g, '');
f = f.replace('put(filename, imageFile, )', 'put(filename, imageFile)');
fs.writeFileSync('src/app/api/bookings/[id]/payment/route.ts', f, 'utf8');
console.log('FIXED: Blob store now uses private access (no public option)');