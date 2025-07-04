const Review = require("../models/review.model");
const Restaurant = require("../models/restaurant.model");
const User = require("../models/user.model");

const reviewController = {
    ratingCalculate: async (req, res) => {
        const { restaurantId } = req.params;
        const reviews = await Review.find({ restaurantId: restaurantId });
        const rating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
        res.status(200).json({ rating });
    },

    createReview: async (req, res) => {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(400).json({ message: "Người dùng không tồn tại" });
        }
        const { restaurantId, rating, comment } = req.body;

        // Kiểm tra quyền user
        if (user.role !== "user") {
            return res.status(403).json({ message: "Bạn không có quyền tạo đánh giá" });
        }


        // Kiểm tra nhà hàng có tồn tại không
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(400).json({ message: "Nhà hàng không tồn tại" });
        }

        // Kiểm tra user đã đánh giá nhà hàng này chưa
        const existingReview = await Review.findOne({
            restaurantId,
            userId: user._id
        });
        if (existingReview) {
            return res.status(400).json({ message: "Bạn đã đánh giá nhà hàng này rồi" });
        }

        // Tạo đánh giá mới
        const newReview = new Review({
            restaurantId,
            userId: user._id,
            rating: rating,
            comment
        });
        await newReview.save();

        res.status(201).json(newReview);
    },


    // For admin
    getReview: async (req, res) => {
        const reviews = await Review.find();
        res.status(200).json(reviews);
    },

    // For user
    getReviewByUser: async (req, res) => {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ message: "Người dùng không tồn tại" });
        }
        const reviews = await Review.find({ userId: user._id });
        res.status(200).json(reviews);
    },

    // For partner
    getReviewByPartner: async (req, res) => {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(400).json({ message: "Nhà hàng không tồn tại" });
        }
        const reviews = await Review.find({ restaurantId: restaurant._id });
        res.status(200).json(reviews);
    },

    // For admin
    getReviewById: async (req, res) => {
        const { id } = req.params;
        const review = await Review.findById(id);
        if (!review) {
            return res.status(400).json({ message: "Đánh giá không tồn tại" });
        }
        res.status(200).json(review);
    },
    updateReview: async (req, res) => {
        const { id } = req.params;
        const { rating, comment } = req.body;

        // Kiểm tra review có tồn tại không
        const review = await Review.findById(id);
        if (!review) {
            return res.status(400).json({ message: "Đánh giá không tồn tại" });
        }

        // Kiểm tra user có quyền chỉnh sửa review này không
        if (review.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa đánh giá này" });
        }

        // Cập nhật review
        const updatedReview = await Review.findByIdAndUpdate(
            id,
            { rating, comment },
            { new: true }
        );

        res.status(200).json(updatedReview);
    },
    deleteReview: async (req, res) => {
        const { id } = req.params;
        const review = await Review.findByIdAndDelete(id);
        if (!review) {
            return res.status(400).json({ message: "Đánh giá không tồn tại" });
        }
        res.status(200).json({ message: "Đánh giá đã được xóa" });
    },
};

module.exports = reviewController;
