const supabase = require('../config/supabase');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
    try {
        const { property, checkInDate, checkOutDate } = req.body;

        // Validate required fields
        if (!property || !checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide property, check-in date, and check-out date',
            });
        }

        // Check if property exists
        const { data: propertyExists, error: propertyError } = await supabase
            .from('properties')
            .select('id, available_beds')
            .eq('id', property)
            .single();

        if (propertyError || !propertyExists) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        // Check if property has available beds
        if (propertyExists.available_beds === 0) {
            return res.status(400).json({
                success: false,
                message: 'No beds available for this property',
            });
        }

        // Create booking
        const { data: booking, error } = await supabase
            .from('bookings')
            .insert([
                {
                    user_id: req.user.id,
                    property_id: property,
                    check_in_date: checkInDate,
                    check_out_date: checkOutDate,
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
            message: 'Booking created successfully',
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
        property:properties!property_id(title, type, city, address, price_per_month, images, gender)
      `)
            .eq('user_id', req.user.id)
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

        if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid status (pending, confirmed, cancelled)',
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
        property:properties!inner(id, title, images, owner_id),
        user:users(name, email, phone)
      `)
            .eq('property.owner_id', req.user.id)
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