const express = require("express");
const reviewRoute = require("./../routes/reviewroute");

const {
  aliastoptours,
  GetAllTours,
  PostATour,
  GetAtour,
  PutTour,
  UpdateTour,
  DeleteAtour,
  GetTourStates,
} = require("../controllars/tourControlar");
const authanticationController = require("./../controllars/authanticationControllar");
const router = express.Router();
router.use("/:tourId/review", reviewRoute);
router
  .route("/")
  .get(GetAllTours)
  .post(
    authanticationController.protect,
    authanticationController.restrictTo("admin", "leader-guide"),
    PostATour
  );
router.route("/tour-states").get(GetTourStates);
router.route("/top-5-cheap").get(aliastoptours, GetAllTours);
router
  .route("/:id")
  .get(GetAtour)
  .put(
    authanticationController.protect,
    authanticationController.restrictTo("admin", "leader-guide"),
    PutTour
  )
  .patch(
    authanticationController.protect,
    authanticationController.restrictTo("admin", "leader-guide"),
    UpdateTour
  )
  .delete(
    authanticationController.protect,
    authanticationController.restrictTo("admin", "leader-guide"),
    DeleteAtour
  );
module.exports = router;
