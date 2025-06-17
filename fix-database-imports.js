const fs = require('fs');
const path = require('path');

function calculateRelativePath(fromFile, toFile) {
  const relativePath = path.relative(path.dirname(fromFile), toFile);
  return relativePath.startsWith('.') ? relativePath : './' + relativePath;
}

function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const targetPath = path.resolve(__dirname, 'src/lib/database-adapter.js');
  const correctRelativePath = calculateRelativePath(filePath, targetPath);
  
  // Reemplazar las importaciones incorrectas
  const newContent = content
    .replace(/from\s+["'].*database\.js["']/g, `from "${correctRelativePath}"`)
    .replace(/from\s+["'].*database-adapter\.js["']/g, `from "${correctRelativePath}"`);
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed: ${filePath}`);
  }
}

function findAndFixFiles(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findAndFixFiles(fullPath);
    } else if (file.endsWith('.js') && (
      fullPath.includes('src/app/api/') || 
      fullPath.includes('src/pages/api/')
    )) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('database.js') || content.includes('database-adapter.js')) {
        fixImportsInFile(fullPath);
      }
    }
  }
}

console.log('Fixing database imports...');
findAndFixFiles('./src');
console.log('Done!');
