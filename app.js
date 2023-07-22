const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const AppError = require("./utils/AppError");
const globleErrorHandler = require("./controllars/errorControllar");
const TourRoute = require("./routes/tourroute");
const userRoute = require("./routes/userroute");
const reviewroute = require("./routes/reviewroute");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);
const limiter = rateLimit({
  max: 300,
  windowMS: 60 * 60 * 1000,
  messege: "too many request from this ip try again after an hour",
});
app.use("/api", limiter);
app.use("/api/v1/tours", TourRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/review", reviewroute);

app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on the server`, 404));
});
app.use(globleErrorHandler);

module.exports = app;
//
