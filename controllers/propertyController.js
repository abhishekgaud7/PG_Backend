const supabase = require('../config/supabase');

// @desc    Get all properties with optional filters
// @route   GET /api/properties
// @access  Public
exports.getAllProperties = async (req, res, next) => {
    try {
        const { city, type, gender, minPrice, maxPrice, ownerId, area, pincode, electricityCharges } = req.query;

        // Build query
        let query = supabase
            .from('properties')
            .select(`
        *,
        owner:users!owner_id(name, email, phone)
      `)
            .eq('is_deleted', false); // Filter out soft-deleted properties

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

        if (area) {
            query = query.ilike('area', `%${area}%`);
        }

        if (pincode) {
            query = query.eq('pincode', pincode);
        }

        if (minPrice) {
            query = query.gte('price_per_month', Number(minPrice));
        }

        if (maxPrice) {
            query = query.lte('price_per_month', Number(maxPrice));
        }

        if (electricityCharges) {
            query = query.lte('electricity_charges', Number(electricityCharges));
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
            .eq('is_deleted', false)
            .single();

        if (error || !property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found or has been deleted',
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
            area,
            pincode,
            pricePerMonth,
            electricityCharges,
            deposit,
            amenities,
            images,
            availableBeds,
            description,
            houseRules,
            latitude,
            longitude,
        } = req.body;

        // Validate required fields
        if (!title || !type || !address || !city || !pricePerMonth || availableBeds === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: title, type, address, city, pricePerMonth, availableBeds',
            });
        }

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
                    area: area || null,
                    pincode: pincode || null,
                    price_per_month: pricePerMonth,
                    electricity_charges: electricityCharges || 0,
                    deposit: deposit || 0,
                    amenities: amenities || [],
                    images: images || [],
                    available_beds: availableBeds,
                    description: description || '',
                    house_rules: houseRules || null,
                    latitude: latitude || null,
                    longitude: longitude || null,
                    is_deleted: false,
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

        // Check if property is soft-deleted
        if (existingProperty.is_deleted) {
            return res.status(404).json({
                success: false,
                message: 'Property has been deleted and cannot be updated',
            });
        }

        // Prepare update data (convert camelCase to snake_case)
        const updateData = {};
        if (req.body.title) updateData.title = req.body.title;
        if (req.body.type) updateData.type = req.body.type;
        if (req.body.gender) updateData.gender = req.body.gender;
        if (req.body.address) updateData.address = req.body.address;
        if (req.body.city) updateData.city = req.body.city;
        if (req.body.area !== undefined) updateData.area = req.body.area;
        if (req.body.pincode !== undefined) updateData.pincode = req.body.pincode;
        if (req.body.pricePerMonth) updateData.price_per_month = req.body.pricePerMonth;
        if (req.body.electricityCharges !== undefined) updateData.electricity_charges = req.body.electricityCharges;
        if (req.body.deposit !== undefined) updateData.deposit = req.body.deposit;
        if (req.body.amenities) updateData.amenities = req.body.amenities;
        if (req.body.images) updateData.images = req.body.images;
        if (req.body.availableBeds !== undefined) updateData.available_beds = req.body.availableBeds;
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.houseRules !== undefined) updateData.house_rules = req.body.houseRules;
        if (req.body.latitude !== undefined) updateData.latitude = req.body.latitude;
        if (req.body.longitude !== undefined) updateData.longitude = req.body.longitude;

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

// @desc    Soft delete property (marks as deleted, keeps in database)
// @route   DELETE /api/properties/:id
// @access  Private (Owner only - own properties)
exports.deleteProperty = async (req, res, next) => {
    try {
        // First check if property exists and belongs to user
        const { data: property, error: fetchError } = await supabase
            .from('properties')
            .select('owner_id, is_deleted')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        // Check if already deleted
        if (property.is_deleted) {
            return res.status(400).json({
                success: false,
                message: 'Property is already deleted',
            });
        }

        // Check if user is the owner
        if (property.owner_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this property',
            });
        }

        // SOFT DELETE: Mark as deleted instead of removing from database
        const { error } = await supabase
            .from('properties')
            .update({
                is_deleted: true,
                deleted_at: new Date().toISOString()
            })
            .eq('id', req.params.id);

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Property deleted successfully (data preserved in database)',
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Restore soft-deleted property
// @route   PATCH /api/properties/:id/restore
// @access  Private (Owner only - own properties)
exports.restoreProperty = async (req, res, next) => {
    try {
        // Check if property exists and belongs to user
        const { data: property, error: fetchError } = await supabase
            .from('properties')
            .select('owner_id, is_deleted')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found',
            });
        }

        // Check if not deleted
        if (!property.is_deleted) {
            return res.status(400).json({
                success: false,
                message: 'Property is not deleted',
            });
        }

        // Check if user is the owner
        if (property.owner_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to restore this property',
            });
        }

        // Restore property
        const { data: restoredProperty, error } = await supabase
            .from('properties')
            .update({
                is_deleted: false,
                deleted_at: null
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Property restored successfully',
            data: restoredProperty,
        });
    } catch (error) {
        next(error);
    }
};
