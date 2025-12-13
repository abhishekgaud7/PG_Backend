const fs = require('fs');
const content = fs.readFileSync('startup_error.txt', 'utf8');
console.log(content);
