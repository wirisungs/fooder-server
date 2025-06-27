const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurants",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    datingOption: {
        type: String,
        enum: ["Người yêu / Vợ / Chồng", "Hẹn hò người lạ"],
        required: true,
    }
});

const Reservation = mongoose.model("reservations", reservationSchema);

module.exports = Reservation;
