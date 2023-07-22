const user = require("./../modals/usermodal");
const CatchAssync = require("../utils/CatchAssync");
const sendEmail = require("../utils/Email");
const AppError = require("../utils/AppError");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { promisify } = require("util");
const { getOne } = require("./handleFactory");

const singedToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const filterObj = (obj, ...allowedFields) => {
  const newObj= {};
  Object.keys (obj).forEach(el => {
  if (allowedFields.includes (el)) newObj[el] =obj[el];
  });
  return newObj; 
  };
  
  const sendnewToken= (user,statusCode,res)=>{
    const token = singedToken(user.id);
    const cookieOptions={
      expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
      httpOnly:true,
    }
    if(process.env.NODE_ENV=='production') cookieOptions.secure=true;
    res.cookie('jwt',token,cookieOptions);

  ////////////////
  user.password=undefined;
  res.status(statusCode).json({
    status: "success",
    token: token,
    user: user,
  });
  return ;
}
exports.signup = CatchAssync(async (req, res, next) => {
  const newUser = await user.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChanged: req.body.passwordChanged,
    role: req.body.role,
    passwordToken: "123",
  });
  sendnewToken(newUser,201,res);
});
exports.login = CatchAssync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if the email andd password exists
  if (!email || !password) {
    return next(new AppError("provide a email and password", 400));
  }
  // check user exits
  const User = await user.findOne({ email }).select("+password");

  //  check email and password matched
  if (!User || !(await User.correctpassword(password, User.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  // const token = singedToken(User._id);
  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
  sendnewToken(User,200,res);

});
exports.protect = CatchAssync(async (req, res, next) => {
  // gett the there is a token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("user not loged in", 401));
  }
  // check is the token is correctr
  const decoder = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check if the user exists or deleted
  // console.log(decoder);
  const currentUser = await user.findById(decoder.id);
  // console.log(currentUser.name);
  if (!currentUser) {
    return next(new AppError("user does not exists"), 401);
  }
  // console.log(decoder);
  // check if the password is changes after taking the token
  if (currentUser.checkPasswordChanges(decoder.iat)) {
    return next(new AppError("user changed password resently , login again"));
  }
  req.user = currentUser;
  next();
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you are not authorised to perform this action", 403)
      );
    }
    next();
  };
};
exports.ResetPassword = CatchAssync(async (req, res, next) => {
  // find the user according to the token
  const { token } = req.params;
  const newtoken = crypto.createHash("sha256").update(token).digest("hex");
  const User = await user.findOne(
    { 
    passwordForgotToken: newtoken ,
    passwordForgotTokenExpires:{$gt:Date.now()}
    }
);

if(!User){
    return next(new AppError('invalid token or the token has been expired')); 
}

  // check the token and set new passwords
  User.password=req.body.password;
  User.passwordConfirm=req.body.passwordConfirm;
  User.passwordForgotToken=undefined;
  User.passwordForgotTokenExpires=undefined;
  await User.save();
  // update the change password property
  //  const ntoken = singedToken(User._id);
  // res.status(200).json({
  //   status: "success",
  //   token : ntoken,
  // });
  sendnewToken(User,200,res);

  // log the user in send a jwt
});
exports.forgotPassword = CatchAssync(async (req, res, next) => {
  // check if the user exits
  const User = await user.findOne({ email: req.body.email });
  if (!User) {
    return next(new AppError("no user found with this email", 404));
  }

  // create token

  const passwordToken = User.createPasswordForgotToken();
  await User.save({ validateBeforeSave: false });
  // console.log(passwordToken,User.passwordForgotToken);

  // send token via mail
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/resetPassword/${passwordToken}`;
  const messege = `forgot your password , submit a patch request with your new password and password confirm 
    to: ${resetUrl} \n if you didn't did a reset request ignore this email`;
  try {
    await sendEmail({
      email: User.email,
      subject: "your password reset token (valid for 10 min only)",
      messege,
    });
    res.status(200).json({
      ststus: "success",
      messege: "token sended to email",
    });
  } catch (err) {
    User.passwordForgotToken = undefined;
    User.passwordForgotTokenExpires = undefined;
    await User.save({ validateBeforeSave: false });
    return next(new AppError("error occoced unable to send mail retry", 500));
  }
  //  next();
});

exports.updatePassword= CatchAssync(async (req,res,next)=>{
  const User = await user.findById(req.user.id).select('+password');
  // 2) Check if POSTed current password is correct
  if (!(await User.correctpassword(req.body.passwordCurrent, User.password))) {
  return next(new AppError('Your current password is wrong.', 401));
  // 3) If so, update password
  }
  User.password = req. body.password; 
  User.passwordConfirm= req.body.passwordConfirm;
  await User.save();
  // User.findByIdAndUpdate will NOT work as intended!
  // 4) Log user in, send JWT
  //    const ntoken = singedToken(User._id);
  //  return res.status(200).json({
  //     status: "success",
  //     token : ntoken,
  //   });
  sendnewToken(User,200,res);

})
exports.updateMe = CatchAssync(async(req,res,next)=>{
 //
 console.log(req.file);
 console.log(req.body);
 if(req.body.password || req.body.passwordConfirm){
return next(new AppError('you cannot change your password here',403));
 } 
//  const User=await user.findById(req.user.id);
 const filteredBody=filterObj(req.body,'name','email');
 const updatedUser= await user.findByIdAndUpdate(req.user.id,filteredBody,
  {
    new:true,
runValidators:true
}
);
res.status(200).json({
  status:"success",
  data:{
  user:updatedUser
  } 
});

});
exports.deleteMe=CatchAssync(async(req,res,next)=>{
  await user.findByIdAndUpdate(req.user.id,{active:false},{runValidators:false});
  res.status(204).json({
    status:"success",
    data:null
  })
})
exports.getMeIdfill=(req,res,next)=>{
  req.params.id=req.user.id;
  next();

}
exports.getMe= getOne(user);