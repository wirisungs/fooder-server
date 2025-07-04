const Restaurant = require("../models/restaurant.model");
const User = require("../models/user.model");

const restaurantController = {
    createRestaurantByPartner: async (req, res) => {
        try {
            const { name, address, phone, rating } = req.body;

            // Validate required fields
            if (!name || !address || !phone) {
                return res.status(400).json({
                    success: false,
                    message: "Tên nhà hàng, địa chỉ và số điện thoại là bắt buộc"
                });
            }

            // Validate phone format
            const phoneRegex = /^0[0-9]{9}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 chữ số)"
                });
            }

            // Check user role
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Người dùng không tồn tại"
                });
            }

            if (user.role !== "partner") {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không có quyền tạo nhà hàng"
                });
            }

            // Check if restaurant name already exists
            const existingRestaurant = await Restaurant.findOne({ name: name.trim() });
            if (existingRestaurant) {
                return res.status(409).json({
                    success: false,
                    message: "Tên nhà hàng đã tồn tại"
                });
            }

            // Create new restaurant
            const newRestaurant = new Restaurant({
                name: name.trim(),
                address: address.trim(),
                phone: phone.replace(/\s/g, ''),
                rating: rating || 0,
                partnerId: user._id
            });

            await newRestaurant.save();

            res.status(201).json({
                success: true,
                message: "Tạo nhà hàng thành công",
                data: newRestaurant
            });

        } catch (error) {
            console.error("Create restaurant error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },

    getRestaurant: async (req, res) => {
        try {
            const { page = 1, limit = 10, rating, search } = req.query;
            const skip = (page - 1) * limit;

            // Build filter object
            const filter = {};
            if (rating) filter.rating = { $gte: parseFloat(rating) };
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { address: { $regex: search, $options: 'i' } }
                ];
            }

            const restaurants = await Restaurant.find(filter)
                .populate('partnerId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Restaurant.countDocuments(filter);

            res.status(200).json({
                success: true,
                data: restaurants,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            });

        } catch (error) {
            console.error("Get restaurants error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },

    getRestaurantById: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "ID nhà hàng là bắt buộc"
                });
            }

            const restaurant = await Restaurant.findById(id)
                .populate('partnerId', 'name email phone');

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: "Nhà hàng không tồn tại"
                });
            }

            res.status(200).json({
                success: true,
                data: restaurant
            });

        } catch (error) {
            console.error("Get restaurant by ID error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },

    updateRestaurant: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, address, phone, rating } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "ID nhà hàng là bắt buộc"
                });
            }

            // Validate phone format if provided
            if (phone) {
                const phoneRegex = /^0[0-9]{9}$/;
                if (!phoneRegex.test(phone)) {
                    return res.status(400).json({
                        success: false,
                        message: "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 chữ số)"
                    });
                }
            }

            // Check if restaurant exists
            const existingRestaurant = await Restaurant.findById(id);
            if (!existingRestaurant) {
                return res.status(404).json({
                    success: false,
                    message: "Nhà hàng không tồn tại"
                });
            }

            // Check if new name conflicts with existing restaurant
            if (name && name !== existingRestaurant.name) {
                const nameConflict = await Restaurant.findOne({
                    name: name.trim(),
                    _id: { $ne: id }
                });
                if (nameConflict) {
                    return res.status(409).json({
                        success: false,
                        message: "Tên nhà hàng đã tồn tại"
                    });
                }
            }

            // Prepare update data
            const updateData = {};
            if (name) updateData.name = name.trim();
            if (address) updateData.address = address.trim();
            if (phone) updateData.phone = phone.replace(/\s/g, '');
            if (rating !== undefined) updateData.rating = rating;

            const restaurant = await Restaurant.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            ).populate('partnerId', 'name email');

            res.status(200).json({
                success: true,
                message: "Cập nhật nhà hàng thành công",
                data: restaurant
            });

        } catch (error) {
            console.error("Update restaurant error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },

    deleteRestaurant: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "ID nhà hàng là bắt buộc"
                });
            }

            const restaurant = await Restaurant.findById(id);
            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: "Nhà hàng không tồn tại"
                });
            }

            await Restaurant.findByIdAndDelete(id);

            res.status(200).json({
                success: true,
                message: "Xóa nhà hàng thành công"
            });

        } catch (error) {
            console.error("Delete restaurant error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },
};

module.exports = restaurantController;
