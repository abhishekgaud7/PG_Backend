const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

try {
    require('./controllers/otpController');
    console.log('Success');
} catch (e) {
    fs.writeFileSync('ref_error.txt', e.name + ': ' + e.message);
}
