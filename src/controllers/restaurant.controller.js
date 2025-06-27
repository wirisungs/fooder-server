const Restaurant = require("../models/restaurant.model");
const User = require("../models/user.model");

const restaurantController = {
    // createRestaurant: async (req, res) => {
    //     const { name, address, rating } = req.body;
    //     const user = await User.findById(req.user.id);
    //     const restaurant = await Restaurant.findOne({ name });
    //     if(user.role !== "admin") {
    //         return res.status(403).json({ message: "Bạn không có quyền tạo nhà hàng" });
    //     }
    //     if (restaurant) {
    //         return res.status(400).json({ message: "Tên nhà hàng đã tồn tại" });
    //     }
    //     const newRestaurant = new Restaurant({ name, address, rating });
    //     await newRestaurant.save();
    //     res.status(201).json(newRestaurant);
    // },
    createRestaurantByPartner: async (req, res) => {
        const { name, address, phone, rating } = req.body;
        const user = await User.findById(req.user.id);
        const restaurant = await Restaurant.findOne({ name });
        if(user.role !== "partner") {
            return res.status(403).json({ message: "Bạn không có quyền tạo nhà hàng" });
        }
        if (restaurant) {
            return res.status(400).json({ message: "Tên nhà hàng đã tồn tại" });
        }
        const newRestaurant = new Restaurant({ name, address, phone, rating, partnerId: user._id });
        await newRestaurant.save();
        res.status(201).json(newRestaurant);
    },
    getRestaurant: async (req, res) => {
        const restaurant = await Restaurant.find();
        if (!restaurant) {
            return res.status(400).json({ message: "Không có nhà hàng nào" });
        }
        res.status(200).json(restaurant);
    },
    getRestaurantById: async (req, res) => {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(400).json({ message: "Nhà hàng không tồn tại" });
        }
        res.status(200).json(restaurant);
    },
    updateRestaurant: async (req, res) => {
        const { id } = req.params;
        const { name, address, phone, rating } = req.body;
        const restaurant = await Restaurant.findByIdAndUpdate(id, { name, address, phone, rating }, { new: true });
        if (!restaurant) {
            return res.status(400).json({ message: "Nhà hàng không tồn tại" });
        }
        res.status(200).json(restaurant);
    },
    deleteRestaurant: async (req, res) => {
        const { id } = req.params;
        const restaurant = await Restaurant.findByIdAndDelete(id);
        if (!restaurant) {
            return res.status(400).json({ message: "Nhà hàng không tồn tại" });
        }
        res.status(200).json({ message: "Nhà hàng đã được xóa" });
    },
};

module.exports = restaurantController;
