const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservation.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");

router.post("/create", authenticateUser, reservationController.createReservation);
router.get("/", authenticateUser, reservationController.getReservation);
router.get("/:id", authenticateUser, reservationController.getReservationById);
router.put("/:id", authenticateUser, reservationController.updateReservation);
router.delete("/:id", authenticateUser, reservationController.deleteReservation);

module.exports = router;
