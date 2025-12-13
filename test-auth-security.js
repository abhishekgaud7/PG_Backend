const http = require('http');

console.log('='.repeat(60));
console.log('AUTHENTICATION SECURITY TESTS');
console.log('='.repeat(60));

// Test 1: Weak Password Rejection
async function testWeakPassword() {
    console.log('\n[TEST 1] Testing weak password rejection...');

    const data = JSON.stringify({
        name: 'Test User',
        email: 'weakpass@test.com',
        phone: '+919876543210',
        password: 'weak',
        role: 'user'
    });

    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5001,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log('Status:', res.statusCode);
                const response = JSON.parse(body);
                if (res.statusCode === 400 && response.errors) {
                    console.log('✅ PASS: Weak password rejected');
                    console.log('Errors:', response.errors);
                } else {
                    console.log('❌ FAIL: Weak password should be rejected');
                }
                resolve();
            });
        });
        req.write(data);
        req.end();
    });
}

// Test 2: Strong Password Acceptance
async function testStrongPassword() {
    console.log('\n[TEST 2] Testing strong password acceptance...');

    const data = JSON.stringify({
        name: 'Strong User',
        email: `strong${Date.now()}@test.com`,
        phone: `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`,
        password: 'StrongPass123!',
        role: 'user'
    });

    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5001,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log('Status:', res.statusCode);
                if (res.statusCode === 201) {
                    console.log('✅ PASS: Strong password accepted');
                } else {
                    console.log('❌ FAIL: Strong password should be accepted');
                    console.log('Response:', body);
                }
                resolve();
            });
        });
        req.write(data);
        req.end();
    });
}

// Test 3: Invalid Email Format
async function testInvalidEmail() {
    console.log('\n[TEST 3] Testing invalid email rejection...');

    const data = JSON.stringify({
        name: 'Test User',
        email: 'notanemail',
        phone: '+919876543210',
        password: 'StrongPass123!',
        role: 'user'
    });

    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5001,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log('Status:', res.statusCode);
                const response = JSON.parse(body);
                if (res.statusCode === 400 && response.message.includes('email')) {
                    console.log('✅ PASS: Invalid email rejected');
                } else {
                    console.log('❌ FAIL: Invalid email should be rejected');
                }
                resolve();
            });
        });
        req.write(data);
        req.end();
    });
}

// Test 4: Invalid Phone Format
async function testInvalidPhone() {
    console.log('\n[TEST 4] Testing invalid phone rejection...');

    const data = JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '123',
        password: 'StrongPass123!',
        role: 'user'
    });

    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5001,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log('Status:', res.statusCode);
                const response = JSON.parse(body);
                if (res.statusCode === 400 && response.message.includes('phone')) {
                    console.log('✅ PASS: Invalid phone rejected');
                } else {
                    console.log('❌ FAIL: Invalid phone should be rejected');
                }
                resolve();
            });
        });
        req.write(data);
        req.end();
    });
}

// Test 5: Account Lockout (multiple failed logins)
async function testAccountLockout() {
    console.log('\n[TEST 5] Testing account lockout after failed attempts...');

    // Use existing test account
    const loginData = JSON.stringify({
        email: 'testapi@example.com',
        password: 'wrongpassword'
    });

    console.log('Attempting 6 failed logins...');

    for (let i = 1; i <= 6; i++) {
        await new Promise((resolve) => {
            const req = http.request({
                hostname: 'localhost',
                port: 5001,
                path: '/api/auth/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': loginData.length
                }
            }, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    const response = JSON.parse(body);
                    console.log(`Attempt ${i}:`, res.statusCode, response.message);

                    if (i === 5 && res.statusCode === 403) {
                        console.log('✅ PASS: Account locked after 5 failed attempts');
                    }
                    resolve();
                });
            });
            req.write(loginData);
            req.end();
        });

        // Small delay between attempts
        await new Promise(r => setTimeout(r, 100));
    }
}

// Run all tests
async function runTests() {
    await testWeakPassword();
    await testStrongPassword();
    await testInvalidEmail();
    await testInvalidPhone();
    await testAccountLockout();

    console.log('\n' + '='.repeat(60));
    console.log('TESTS COMPLETE');
    console.log('='.repeat(60));
}

runTests();
