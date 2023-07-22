const ApiFeatures = require("./../utils/ApiFeatures");
const User = require("./../modals/usermodal");
const CatchAssync = require("../utils/CatchAssync");
const { deleteOne, updateOne, getOne, getAll } = require("./handleFactory");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/AppError");
// const multerStorage=multer.diskStorage({
//   destination:(req,file,cb)=>{
//     cb(null,'./public')
//   },
//   filename:(req,file,cb)=>{
//     const ext=file.mimetype.split('/')[1];
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// })
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("please uplaod images only", 400));
  }
};
exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();
  req.filename=`user-${req.user.id}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`./public/${req.filename}`);
    next();
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.PostAuser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.Putuser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

exports.GetAlluser = getAll(User);

exports.deleteUser = deleteOne(User);
exports.updateUser = updateOne(User);
exports.GetAuser = getOne(User);
exports.uploadUserPhoto = upload.single("photo");
