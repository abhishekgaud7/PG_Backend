const supabase = require('../config/supabase');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
    try {
        const {
            property,
            checkInDate,
            checkOutDate,
            paymentInfo,
            govtId,
            emergencyName,
            emergencyPhone,
        } = req.body;

        // Validate required fields
        if (!property || !checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide property, check-in date, and check-out date',
            });
        }

        // Validate emergency contact (optional but recommended)
        if (emergencyName && !emergencyPhone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide emergency contact phone number',
            });
        }

        // Validate payment information
        if (!paymentInfo || !paymentInfo.type || !paymentInfo.status || !paymentInfo.id) {
            return res.status(400).json({
                success: false,
                message: 'Please provide complete payment information (type, status, id)',
            });
        }

        // Validate payment type
        if (!['Mock', 'Cash'].includes(paymentInfo.type)) {
            return res.status(400).json({
                success: false,
                message: 'Payment type must be either "Mock" or "Cash"',
            });
        }

        // Validate payment status based on type
        if (paymentInfo.type === 'Cash' && paymentInfo.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cash payment status must be "pending"',
            });
        }

        if (paymentInfo.type === 'Mock' && paymentInfo.status !== 'success') {
            return res.status(400).json({
                success: false,
                message: 'Mock payment status must be "success"',
            });
        }

        // Check if property exists and is not deleted
        const { data: propertyExists, error: propertyError } = await supabase
            .from('properties')
            .select('id, available_beds, price_per_month, is_deleted')
            .eq('id', property)
            .single();

        if (propertyError || !propertyExists) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        // Check if property is soft-deleted
        if (propertyExists.is_deleted) {
            return res.status(400).json({
                success: false,
                message: 'This property is no longer available',
            });
        }

        // Check if property has available beds
        if (propertyExists.available_beds === 0) {
            return res.status(400).json({
                success: false,
                message: 'No beds available for this property',
            });
        }

        // Calculate total amount based on dates and property price
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalAmount = paymentInfo.amount || Math.ceil((days / 30) * propertyExists.price_per_month);

        // Determine booking status based on payment type
        const bookingStatus = paymentInfo.type === 'Mock' && paymentInfo.status === 'success'
            ? 'confirmed'
            : 'pending';

        // Create booking with payment information
        const { data: booking, error } = await supabase
            .from('bookings')
            .insert([
                {
                    user_id: req.user.id,
                    property_id: property,
                    check_in_date: checkInDate,
                    check_out_date: checkOutDate,
                    govt_id: govtId || null,
                    emergency_name: emergencyName || null,
                    emergency_phone: emergencyPhone || null,
                    payment_type: paymentInfo.type,
                    payment_status: paymentInfo.status,
                    payment_id: paymentInfo.id,
                    total_amount: totalAmount,
                    status: bookingStatus,
                    is_deleted: false,
                },
            ])
            .select(`
        *,
        user:users!user_id(name, email, phone),
        property:properties!property_id(title, type, city, price_per_month)
      `)
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json({
            success: true,
            message: paymentInfo.type === 'Cash'
                ? 'Booking created successfully. Payment due on check-in.'
                : 'Booking confirmed! Payment successful.',
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bookings for logged-in user
// @route   GET /api/bookings/my
// @access  Private
exports.getUserBookings = async (req, res, next) => {
    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
        *,
        property:properties!property_id(title, type, city, address, price_per_month, images, gender, is_deleted)
      `)
            .eq('user_id', req.user.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Filter out bookings for deleted properties
        const activeBookings = bookings.filter(booking => !booking.property?.is_deleted);

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            count: activeBookings.length,
            data: activeBookings,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bookings for a property (owner only)
// @route   GET /api/bookings/property/:propertyId
// @access  Private (Owner only)
exports.getPropertyBookings = async (req, res, next) => {
    try {
        const { propertyId } = req.params;

        // Check if property exists and belongs to user
        const { data: property, error: propertyError } = await supabase
            .from('properties')
            .select('owner_id')
            .eq('id', propertyId)
            .single();

        if (propertyError || !property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        if (property.owner_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view bookings for this property',
            });
        }

        // Get bookings
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
        *,
        user:users!user_id(name, email, phone)
      `)
            .eq('property_id', propertyId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private (Owner only)
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status || !['pending', 'confirmed', 'rejected', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid status (pending, confirmed, rejected, cancelled, completed)',
            });
        }

        // Get booking with property info
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
        *,
        property:properties!property_id(owner_id)
      `)
            .eq('id', req.params.id)
            .single();

        if (fetchError || !booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check if booking is soft-deleted
        if (booking.is_deleted) {
            return res.status(400).json({
                success: false,
                message: 'This booking has been cancelled and cannot be updated',
            });
        }

        // Check if user is the property owner
        if (booking.property.owner_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this booking',
            });
        }

        // Update booking status
        const { data: updatedBooking, error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: updatedBooking,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bookings across all properties owned by the user
// @route   GET /api/bookings/owner
// @access  Private (Owner only)
exports.getOwnerBookings = async (req, res, next) => {
    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
        *,
        property:properties!inner(id, title, images, owner_id, is_deleted),
        user:users(name, email, phone)
      `)
            .eq('property.owner_id', req.user.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Filter out bookings for deleted properties
        const activeBookings = bookings.filter(booking => !booking.property?.is_deleted);

        res.status(200).json({
            success: true,
            count: activeBookings.length,
            data: activeBookings,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Soft delete booking (user cancels own booking)
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
    try {
        // Get booking
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('user_id, property_id, is_deleted')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check if already deleted
        if (booking.is_deleted) {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled',
            });
        }

        // Check if user owns this booking
        if (booking.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to cancel this booking',
            });
        }

        // SOFT DELETE: Mark as deleted
        const { error } = await supabase
            .from('bookings')
            .update({ 
                is_deleted: true, 
                deleted_at: new Date().toISOString(),
                status: 'cancelled'
            })
            .eq('id', req.params.id);

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully (data preserved in database)',
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Restore soft-deleted booking
// @route   PATCH /api/bookings/:id/restore
// @access  Private (Owner only)
exports.restoreBooking = async (req, res, next) => {
    try {
        // Get booking with property info
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
        *,
        property:properties!property_id(owner_id)
      `)
            .eq('id', req.params.id)
            .single();

        if (fetchError || !booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check if not deleted
        if (!booking.is_deleted) {
            return res.status(400).json({
                success: false,
                message: 'Booking is not cancelled',
            });
        }

        // Check if user is the property owner
        if (booking.property.owner_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to restore this booking',
            });
        }

        // Restore booking
        const { data: restoredBooking, error } = await supabase
            .from('bookings')
            .update({ 
                is_deleted: false, 
                deleted_at: null,
                status: 'pending'
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Booking restored successfully',
            data: restoredBooking,
        });
    } catch (error) {
        next(error);
    }
};
