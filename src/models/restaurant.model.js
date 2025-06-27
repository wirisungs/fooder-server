const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: false,
    },
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
});

const Restaurant = mongoose.model("restaurants", restaurantSchema);

module.exports = Restaurant;
