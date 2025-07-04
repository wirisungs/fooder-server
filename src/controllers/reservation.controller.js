const Reservation = require("../models/reservation.model");
const User = require("../models/user.model");
const Restaurant = require("../models/restaurant.model");

const reservationController = {
    // For user
    createReservation: async (req, res) => {
        try {
            const { restaurantId, userId, date, datingOption } = req.body;

            // Validate required fields
            if (!restaurantId || !userId || !date || !datingOption) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin bắt buộc: restaurantId, userId, date, datingOption"
                });
            }

            // Validate date format and ensure it's in the future
            const reservationDate = new Date(date);
            const currentDate = new Date();

            if (isNaN(reservationDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Định dạng ngày không hợp lệ"
                });
            }

            if (reservationDate <= currentDate) {
                return res.status(400).json({
                    success: false,
                    message: "Ngày đặt bàn phải trong tương lai"
                });
            }

            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Người dùng không tồn tại"
                });
            }

            // Check if restaurant exists
            const restaurant = await Restaurant.findById(restaurantId);
            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: "Nhà hàng không tồn tại"
                });
            }

            // Check for existing reservation on the same date
            const existingReservation = await Reservation.findOne({
                restaurantId,
                userId,
                date: reservationDate,
                status: { $nin: ['cancelled', 'rejected'] }
            });

            if (existingReservation) {
                return res.status(409).json({
                    success: false,
                    message: "Bạn đã có đặt bàn tại nhà hàng này vào ngày này"
                });
            }

            // Create new reservation
            const newReservation = new Reservation({
                restaurantId,
                userId,
                date: reservationDate,
                datingOption,
                status: 'pending'
            });

            await newReservation.save();

            res.status(201).json({
                success: true,
                message: "Đặt bàn thành công",
                data: newReservation
            });

        } catch (error) {
            console.error("Create reservation error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },

    // For admin
    getReservation: async (req, res) => {
        try {
            const { page = 1, limit = 10, status, restaurantId, userId } = req.query;
            const skip = (page - 1) * limit;

            // Build filter object
            const filter = {};
            if (status) filter.status = status;
            if (restaurantId) filter.restaurantId = restaurantId;
            if (userId) filter.userId = userId;

            const reservations = await Reservation.find(filter)
                .populate('userId', 'name email phone')
                .populate('restaurantId', 'name address')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Reservation.countDocuments(filter);

            res.status(200).json({
                success: true,
                data: reservations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            });

        } catch (error) {
            console.error("Get reservations error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },

    getReservationById: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "ID đặt bàn là bắt buộc"
                });
            }

            const reservation = await Reservation.findById(id)
                .populate('userId', 'name email phone')
                .populate('restaurantId', 'name address phone');

            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: "Đặt bàn không tồn tại"
                });
            }

            res.status(200).json({
                success: true,
                data: reservation
            });

        } catch (error) {
            console.error("Get reservation by ID error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },

    updateReservation: async (req, res) => {
        try {
            const { id } = req.params;
            const { restaurantId, userId, date, datingOption, status } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "ID đặt bàn là bắt buộc"
                });
            }

            // Check if reservation exists
            const existingReservation = await Reservation.findById(id);
            if (!existingReservation) {
                return res.status(404).json({
                    success: false,
                    message: "Đặt bàn không tồn tại"
                });
            }

            // Validate date if provided
            if (date) {
                const reservationDate = new Date(date);
                if (isNaN(reservationDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Định dạng ngày không hợp lệ"
                    });
                }
            }

            // Update reservation
            const updateData = {};
            if (restaurantId) updateData.restaurantId = restaurantId;
            if (userId) updateData.userId = userId;
            if (date) updateData.date = new Date(date);
            if (datingOption) updateData.datingOption = datingOption;
            if (status) updateData.status = status;

            const reservation = await Reservation.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            ).populate('userId', 'name email phone')
             .populate('restaurantId', 'name address');

            res.status(200).json({
                success: true,
                message: "Cập nhật đặt bàn thành công",
                data: reservation
            });

        } catch (error) {
            console.error("Update reservation error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },

    deleteReservation: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "ID đặt bàn là bắt buộc"
                });
            }

            const reservation = await Reservation.findByIdAndDelete(id);

            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: "Đặt bàn không tồn tại"
                });
            }

            res.status(200).json({
                success: true,
                message: "Xóa đặt bàn thành công"
            });

        } catch (error) {
            console.error("Delete reservation error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },

    // For partner
    getReservationByPartner: async (req, res) => {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10, status, date } = req.query;
            const skip = (page - 1) * limit;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "ID nhà hàng là bắt buộc"
                });
            }

            // Build filter object
            const filter = { restaurantId: id };
            if (status) filter.status = status;
            if (date) {
                const searchDate = new Date(date);
                if (!isNaN(searchDate.getTime())) {
                    filter.date = {
                        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
                        $lt: new Date(searchDate.setHours(23, 59, 59, 999))
                    };
                }
            }

            const reservations = await Reservation.find(filter)
                .populate('userId', 'name email phone')
                .sort({ date: 1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Reservation.countDocuments(filter);

            res.status(200).json({
                success: true,
                data: reservations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            });
        } catch (error) {
            console.error("Get reservations by partner error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },

    acceptReservation: async (req, res) => {
        try {
        const { id } = req.params;
        const reservation = await Reservation.findByIdAndUpdate(id, { status: "accepted" }, { new: true });
        if (!reservation) {
            return res.status(400).json({ message: "Đặt bàn không tồn tại" });
        }
            res.status(200).json(reservation);
        } catch (error) {
            console.error("Accept reservation error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },

    rejectReservation: async (req, res) => {
        try {
          const { id } = req.params;
          const reservation = await Reservation.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
        if (!reservation) {
            return res.status(400).json({ message: "Đặt bàn không tồn tại" });
        }
            res.status(200).json(reservation);
        } catch (error) {
            console.error("Reject reservation error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },
};

module.exports = reservationController;
