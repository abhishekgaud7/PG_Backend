const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

try {
    console.log('Attempting to require routes/auth_new...');
    require('./routes/auth_new');
    console.log('Success!');
} catch (e) {
    fs.writeFileSync('full_error.txt', e.stack);
}
