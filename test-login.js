const http = require('http');

// Test login of the user we just created
const data = JSON.stringify({
    email: 'testapi@example.com',
    password: 'password123'
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing Login API...');

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', body);
        if (res.statusCode === 200) {
            console.log('\n✅ SUCCESS: Login working!');
        }
    });
});

req.on('error', (error) => {
    console.error(' Error:', error);
});

req.write(data);
req.end();
