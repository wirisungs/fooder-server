const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: [
        {
            province: { type: String, required: true },
            district: { type: String, required: true },
            ward: { type: String, required: true }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    avatarUrl: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    address: [
        {
            province: { type: String, required: true },
            district: { type: String, required: true },
            ward: { type: String, required: true }
        }
    ],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
