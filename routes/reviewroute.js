const express = require("express");
const authanticationController=require("./../controllars/authanticationControllar");

const router = express.Router({mergeParams:true});

const {
  getAllReview,
  createReview,
  deleteReview,
  updateReview,
  setarguments,
  getAReview,
} = require("./../controllars/reviewControllar");
router.use(authanticationController.protect);
router.route('/').get(getAllReview);
router.route('/').post(authanticationController.restrictTo('user'),setarguments,createReview);
router.route('/:id').get(getAReview);
router.route('/:id').delete(authanticationController.restrictTo('user','admin'),deleteReview);
router.route('/:id').patch(authanticationController.restrictTo('user','admin'),updateReview);
module.exports=router;