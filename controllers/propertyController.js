const supabase = require('../config/supabase');

// @desc    Get all properties with optional filters
// @route   GET /api/properties
// @access  Public
exports.getAllProperties = async (req, res, next) => {
    try {
        const { city, type, gender, minPrice, maxPrice, ownerId } = req.query;

        // Build query
        let query = supabase
            .from('properties')
            .select(`
        *,
        owner:users!owner_id(name, email, phone)
      `);

        // Apply filters
        if (city) {
            query = query.ilike('city', `%${city}%`);
        }

        if (type) {
            query = query.eq('type', type);
        }

        if (gender) {
            query = query.eq('gender', gender);
        }

        if (minPrice) {
            query = query.gte('price_per_month', Number(minPrice));
        }

        if (maxPrice) {
            query = query.lte('price_per_month', Number(maxPrice));
        }

        if (ownerId) {
            query = query.eq('owner_id', ownerId);
        }

        // Execute query and sort by newest first
        query = query.order('created_at', { ascending: false });

        const { data: properties, error } = await query;

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res, next) => {
    try {
        const { data: property, error } = await supabase
            .from('properties')
            .select(`
        *,
        owner:users!owner_id(name, email, phone)
      `)
            .eq('id', req.params.id)
            .single();

        if (error || !property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        res.status(200).json({
            success: true,
            data: property,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Owner only)
exports.createProperty = async (req, res, next) => {
    try {
        const {
            title,
            type,
            gender,
            address,
            city,
            pricePerMonth,
            deposit,
            amenities,
            images,
            availableBeds,
            description,
        } = req.body;

        // Create property with owner_id
        const { data: property, error } = await supabase
            .from('properties')
            .insert([
                {
                    owner_id: req.user.id,
                    title,
                    type,
                    gender: gender || 'Any',
                    address,
                    city,
                    price_per_month: pricePerMonth,
                    deposit: deposit || 0,
                    amenities: amenities || [],
                    images: images || [],
                    available_beds: availableBeds,
                    description: description || '',
                },
            ])
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            data: property,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner only - own properties)
exports.updateProperty = async (req, res, next) => {
    try {
        // First check if property exists and belongs to user
        const { data: existingProperty, error: fetchError } = await supabase
            .from('properties')
            .select('owner_id')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !existingProperty) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        // Check if user is the owner
        if (existingProperty.owner_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this property',
            });
        }

        // Prepare update data (convert camelCase to snake_case)
        const updateData = {};
        if (req.body.title) updateData.title = req.body.title;
        if (req.body.type) updateData.type = req.body.type;
        if (req.body.gender) updateData.gender = req.body.gender;
        if (req.body.address) updateData.address = req.body.address;
        if (req.body.city) updateData.city = req.body.city;
        if (req.body.pricePerMonth) updateData.price_per_month = req.body.pricePerMonth;
        if (req.body.deposit !== undefined) updateData.deposit = req.body.deposit;
        if (req.body.amenities) updateData.amenities = req.body.amenities;
        if (req.body.images) updateData.images = req.body.images;
        if (req.body.availableBeds !== undefined) updateData.available_beds = req.body.availableBeds;
        if (req.body.description !== undefined) updateData.description = req.body.description;

        // Update property
        const { data: property, error } = await supabase
            .from('properties')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            data: property,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner only - own properties)
exports.deleteProperty = async (req, res, next) => {
    try {
        // First check if property exists and belongs to user
        const { data: property, error: fetchError } = await supabase
            .from('properties')
            .select('owner_id')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        // Check if user is the owner
        if (property.owner_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this property',
            });
        }

        // Delete property
        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', req.params.id);

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Property deleted successfully',
            data: {},
        });
    } catch (error) {
        next(error);
    }
};
