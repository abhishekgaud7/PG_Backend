const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin operations
console.log('DEBUG: Supabase Config Loading...');
console.log('DEBUG: URL available:', !!process.env.SUPABASE_URL);
console.log('DEBUG: KEY available:', !!process.env.SUPABASE_SERVICE_KEY);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

module.exports = supabase;
