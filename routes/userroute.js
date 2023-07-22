const express = require("express");


const {
  GetAlluser,
  PostAuser,
  GetAuser,
  Putuser,
  deleteUser,
  uploadUserPhoto,
  resizeUserPhoto,
  updateUser
} = require("../controllars/usercontrolar");
const {
 signup,login,
 ResetPassword,
 forgotPassword,
 protect,
 updateMe,
 deleteMe,
 updatePassword,
 getMe,
 getMeIdfill,
 restrictTo,
} = require("../controllars/authanticationControllar");

uploadUserPhoto
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);

router.route("/forgotPassword").post(forgotPassword);
router.route("/ResetPassword/:token").patch(ResetPassword);

router.use(protect); // after this all routes are protected only logged user can access

router.route("/").get(GetAlluser).post(PostAuser);
router.route("/updatePassword/").patch(updatePassword);
router.route("/deleteMe/").delete(deleteMe);
router.route("/updateMe/").patch(uploadUserPhoto,resizeUserPhoto,updateMe);
router.route("/me/").get(getMeIdfill,getMe);

router.use(restrictTo('admin')); // admin authorities

router.route("/:id").get(GetAuser).put(Putuser).delete(deleteUser).patch(updateUser);
module.exports = router;
