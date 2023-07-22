const CatchAssync = require("../utils/CatchAssync");
const AppError = require("../utils/AppError");
const review = require("./../modals/reviewModal");
const user = require("./../modals/usermodal");
const ApiFeatures = require("./../utils/ApiFeatures");
const { deleteOne, updateOne, createOne, getOne, getAll } = require("./handleFactory");
exports.setarguments= (req,res,next)=>{
  req.body.tour=req.params.tourId;
  req.body.user=req.user.id;
  next();
}
exports.getAllReview = getAll(review);
exports.createReview = createOne(review);
exports.deleteReview = deleteOne(review);
exports.updateReview = updateOne(review);
exports.getAReview = getOne(review);
