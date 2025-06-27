const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurant.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");

router.post("/create", authenticateUser, restaurantController.createRestaurantByPartner);
router.get("/get", restaurantController.getRestaurant);
router.get("/get/:id", restaurantController.getRestaurantById);
router.put("/update/:id", authenticateUser, restaurantController.updateRestaurant);
router.delete("/delete/:id", authenticateUser, restaurantController.deleteRestaurant);

module.exports = router;
