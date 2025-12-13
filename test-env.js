const dotenv = require('dotenv');
const result = dotenv.config();

console.log('Dotenv parsed:', result.parsed ? Object.keys(result.parsed) : 'Failed');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY length:', process.env.SUPABASE_SERVICE_KEY ? process.env.SUPABASE_SERVICE_KEY.length : 'Missing');
