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
    role: {
      type: String,
      enum: ["admin", "user", "partner"],
      default: "user",
    },
    phone: {
        type: String,
        required: function() { return this.role === 'user'; },
    },
    birthday: {
        type: String,
        required: function() { return this.role === 'user'; },
    },
    address: [
        {
            province: { type: String, required: function() { return this.parent().role === 'user'; } },
            district: { type: String, required: function() { return this.parent().role === 'user'; } },
            ward: { type: String, required: function() { return this.parent().role === 'user'; } },
            _id: false // Để tránh lỗi khi tạo user
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
    avatarUrl: {
        type: String,
        default: "",
        required: function() { return this.role === 'user'; },
    },
    bio: {
        type: String,
        default: "",
        required: function() { return this.role === 'user'; },
    },
    username: {
        type: String,
        required: true,
        unique: true,
        required: function() { return this.role === 'user'; },
    },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
