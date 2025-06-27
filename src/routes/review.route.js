const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");

router.post("/create", authenticateUser, reviewController.createReview);
router.get("/", authenticateUser, reviewController.getReview);
router.get("/user/:id", authenticateUser, reviewController.getReviewByUser);
router.put("/:id", authenticateUser, reviewController.updateReview);
router.delete("/:id", authenticateUser, reviewController.deleteReview);
router.get("/partner/:id", authenticateUser, reviewController.getReviewByPartner);

module.exports = router;
