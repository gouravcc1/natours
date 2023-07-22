const mongoose = require("mongoose");
// review, createdAtdate   ,refToTOur ,refToUser
const Tour = require("./tourmodal");
const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "a review cant be empty"],
      maxLength: 100,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "tour",
      required: [true, "a review cannot be without tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "a review cannot be without user"],
    },
  },
  {
    toJSON: { virtuals: true },
    to0bject: { virtuals: true },
  }
);
reviewSchema.index({tour:1,user:1},{unique:true});
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email",
  });
  next();
});
reviewSchema.statics.calculateAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: "$tour",
        nrating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nrating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
  // console.log(stats);
};
reviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.tour);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calculateAverageRating(this.r.tour);
});
const review = mongoose.model("review", reviewSchema);
module.exports = review;
/*
getting all reviews
creating new reviews
*/
