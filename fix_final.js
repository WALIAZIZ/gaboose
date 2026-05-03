const fs = require('fs');
const path = require('path');

// FIX 1: Payment proof - add { access: 'private' }
console.log('--- FIX 1: Payment proof ---');
try {
  var dir = 'src/app/api/bookings';
  var files = fs.readdirSync(dir);
  var idDir = null;
  for (var f of files) { if (f.startsWith('[')) { idDir = path.join(dir, f); break; } }
  var routePath = path.join(idDir, 'payment', 'route.ts');
  var src = fs.readFileSync(routePath, 'utf8');
  src = src.replace(
    "const blob = await put(filename, imageFile)",
    "const blob = await put(filename, imageFile, { access: 'private' })"
  );
  fs.writeFileSync(routePath, src, 'utf8');
  console.log('  [OK] Payment proof: added access private');
} catch(e) { console.log('  [ERROR] ' + e.message); }

// FIX 2: Check if admin menu page has image upload
console.log('\n--- FIX 2: Admin menu page ---');
try {
  var adminMenu = fs.readFileSync('src/app/admin/menu/page.tsx', 'utf8');
  if (adminMenu.includes('image')) {
    console.log('  [INFO] Admin menu page already has image field');
  } else {
    console.log('  [INFO] Admin menu page needs image field');
    console.log('  Showing first 500 chars:');
    console.log(adminMenu.substring(0, 500));
  }
} catch(e) { console.log('  [ERROR] ' + e.message); }

console.log('\n=== DONE ===');