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
    rating: {
        type: Number,
        required: false,
    },
});

const Restaurant = mongoose.model("restaurants", restaurantSchema);

module.exports = Restaurant;
