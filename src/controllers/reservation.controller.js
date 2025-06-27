const Reservation = require("../models/reservation.model");
const User = require("../models/user.model");
const Restaurant = require("../models/restaurant.model");

const reservationController = {
    // For user
    createReservation: async (req, res) => {
        const { restaurantId, userId, date, datingOption } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "Người dùng không tồn tại" });
        }
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(400).json({ message: "Nhà hàng không tồn tại" });
        }
        const reservation = await Reservation.findOne({ restaurantId, userId, date });
        if (reservation) {
            return res.status(400).json({ message: "Đặt bàn đã tồn tại" });
        }

        const newReservation = new Reservation({ restaurantId, userId, date, datingOption });
        await newReservation.save();
        res.status(201).json(newReservation);
    },

    // For admin
    getReservation: async (req, res) => {
        const reservations = await Reservation.find();
        res.status(200).json(reservations);
    },
    getReservationById: async (req, res) => {
        const { id } = req.params;
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(400).json({ message: "Đặt bàn không tồn tại" });
        }
        res.status(200).json(reservation);
    },
    updateReservation: async (req, res) => {
        const { id } = req.params;
        const { restaurantId, userId, date, datingOption } = req.body;
        const reservation = await Reservation.findByIdAndUpdate(id, { restaurantId, userId, date, datingOption }, { new: true });
        if (!reservation) {
            return res.status(400).json({ message: "Đặt bàn không tồn tại" });
        }
        res.status(200).json(reservation);
    },
    deleteReservation: async (req, res) => {
        const { id } = req.params;
        const reservation = await Reservation.findByIdAndDelete(id);
        if (!reservation) {
            return res.status(400).json({ message: "Đặt bàn không tồn tại" });
        }
        res.status(200).json({ message: "Đặt bàn đã được xóa" });
    },

    // For partner
    getReservationByPartner: async (req, res) => {
        const { id } = req.params;
        const reservations = await Reservation.find({ restaurantId: id });
        res.status(200).json(reservations);
    },
    acceptReservation: async (req, res) => {
        const { id } = req.params;
        const reservation = await Reservation.findByIdAndUpdate(id, { status: "accepted" }, { new: true });
        if (!reservation) {
            return res.status(400).json({ message: "Đặt bàn không tồn tại" });
        }
        res.status(200).json(reservation);
    },
    rejectReservation: async (req, res) => {
        const { id } = req.params;
        const reservation = await Reservation.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
        if (!reservation) {
            return res.status(400).json({ message: "Đặt bàn không tồn tại" });
        }
        res.status(200).json(reservation);
    },
};

module.exports = reservationController;
