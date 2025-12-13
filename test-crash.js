try {
    require('./controllers/otpController');
    console.log('Success!');
} catch (e) {
    console.error('Error Details:');
    console.error(e);
}
