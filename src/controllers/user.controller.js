const User = require("../models/user.model");

const userController = {
    getUser: async (req, res) => {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(400).json({ message: "Người dùng không tồn tại" });
        }
        res.status(200).json(user);
    },
    updateUser: async (req, res) => {
        const { name, phone, birthday, address, avatarUrl, bio, username } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(400).json({ message: "Người dùng không tồn tại" });
        }
        const addressArray = address.split(",");
        const province = addressArray[0];
        const district = addressArray[1];
        const ward = addressArray[2];
        const addressObject = { province, district, ward };
        user.name = name;
        user.phone = phone;
        user.birthday = birthday;
        user.address = addressObject;
        user.avatarUrl = avatarUrl;
        user.bio = bio;
        user.username = username;
        await user.save();
        res.status(200).json(user);
    },
};

module.exports = userController;
