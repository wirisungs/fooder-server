const express = require('express');
const app = express();
const restaurantRoute = require("./routes/restaurant.route");
const authRoute = require("./routes/auth.route");
const reservationRoute = require("./routes/reservation.route");
const reviewRoute = require("./routes/review.route");
const cors = require("cors");

app.use(express.json());
app.use(cors());


app.use("/api/restaurant", restaurantRoute);
app.use("/api/auth", authRoute);
app.use("/api/reservation", reservationRoute);
app.use("/api/review", reviewRoute);

module.exports = app;
