// SMS Service - Mock Implementation for Development
// Replace with Twilio/AWS SNS in production

const supabase = require('../config/supabase');

/**
 * Generate a random 6-digit OTP code
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via SMS (Mock - logs to console)
 * In production, replace with actual SMS service
 */
const sendSMS = async (phone, message) => {
    // Mock implementation - log to console
    console.log('='.repeat(50));
    console.log('📱 SMS SENT (Mock)');
    console.log('To:', phone);
    console.log('Message:', message);
    console.log('='.repeat(50));

    // In production, use Twilio:
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const client = require('twilio')(accountSid, authToken);
    // 
    // await client.messages.create({
    //     body: message,
    //     from: process.env.TWILIO_PHONE_NUMBER,
    //     to: phone
    // });

    return { success: true };
};

/**
 * Send OTP code to phone number
 */
const sendOTP = async (phone) => {
    try {
        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store OTP in database
        const { error } = await supabase
            .from('otp_codes')
            .insert([{
                phone,
                code,
                expires_at: expiresAt.toISOString()
            }]);

        if (error) throw error;

        // Send SMS
        const message = `Your RoomNest OTP is: ${code}. Valid for 5 minutes.`;
        await sendSMS(phone, message);

        // In development, return the code for testing
        // REMOVE THIS IN PRODUCTION!
        const isDevelopment = process.env.NODE_ENV !== 'production';

        return {
            success: true,
            expiresAt,
            // Only include code in development mode
            ...(isDevelopment && { code })
        };
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
};

/**
 * Verify OTP code
 */
const verifyOTP = async (phone, code) => {
    try {
        // Find valid OTP
        const { data: otpRecord, error } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('phone', phone)
            .eq('code', code)
            .eq('verified', false)
            .gte('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !otpRecord) {
            return { isValid: false, error: 'Invalid or expired OTP' };
        }

        // Mark as verified
        await supabase
            .from('otp_codes')
            .update({ verified: true })
            .eq('id', otpRecord.id);

        return { isValid: true };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { isValid: false, error: 'OTP verification failed' };
    }
};

/**
 * Clean up expired OTP codes
 */
const cleanupExpiredOTPs = async () => {
    try {
        await supabase
            .from('otp_codes')
            .delete()
            .lt('expires_at', new Date().toISOString())
            .eq('verified', false);
    } catch (error) {
        console.error('Error cleaning up OTPs:', error);
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
    cleanupExpiredOTPs,
    sendSMS
};
