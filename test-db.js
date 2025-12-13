require('dotenv').config();
const supabase = require('./config/supabase');

console.log('Testing Supabase Connection via config module...');
// Read key from config module? config/supabase.js exports the client, not the key.
// I have to read process.env again here to be comparable, OR use the client's internal key if possible (not exposed).
// Let's rely on process.env as that's what config uses.
const key = process.env.SUPABASE_SERVICE_KEY || '';
console.log('DEBUG: KEY_PREFIX:', key.substring(0, 10));

async function testConnection() {
    try {
        console.log('Attempting HEAD request...');
        const resHead = await supabase.from('users').select('count', { count: 'exact', head: true });
        console.log('HEAD Result:', JSON.stringify(resHead, null, 2));

        console.log('Attempting SELECT request...');
        const resSelect = await supabase
            .from('users')
            .select('id')
            .eq('email', 'testapi@example.com')
            .single();
        console.log('SELECT Result:', JSON.stringify(resSelect, null, 2));

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
