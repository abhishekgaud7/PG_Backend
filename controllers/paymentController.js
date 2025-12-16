// @desc    Mock payment endpoint for testing
// @route   POST /api/payments/mock-success
// @access  Private
exports.mockPayment = async (req, res, next) => {
    try {
        const { amount } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid amount',
            });
        }

        // Simulate payment processing delay (optional)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Generate mock payment ID
        const paymentId = `MOCK_PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Return successful payment response
        res.status(200).json({
            success: true,
            payment_id: paymentId,
            status: 'success',
            amount: amount,
            message: 'Mock payment processed successfully',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        next(error);
    }
};
