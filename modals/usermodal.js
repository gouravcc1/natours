const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { time } = require("console");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    requere: [true, "user must have a name"],
  },
  email: {
    type: String,
    require: [true, "please  provide your email"],
    unique: true,
    lowecase: true,
    validate: [validator.isEmail, "provide a valide email"],
  },

  photo: {
    type: String,
  },
  role:{
    type:String,
    enum:["admin","user","guide","leader-guide"],
    default:'user'
  },
  password: {
    type: String,
    require: [true, "provide password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, "please confirm password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
    select: false,
    messege: "password did not match",
  },
  active:{
    type:Boolean,
    default:true,
    select:false
  },
  passwordChanged: Date,
  passwordForgotToken:String,
  passwordForgotTokenExpires:Date,

});
userSchema.pre(/^find/,function(next){
  this.find({active:{
    $ne:false
  }})
  next();
})
userSchema.pre('save', function(next){
  if(!this.isModified('password') || this.isNew) return next();
  this.passwordChanged=Date.now()-1000;
  next();
})
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // runs only when passward
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.methods.correctpassword = async function (
  canditatePassword,
  userPassword
) {
  return await bcrypt.compare(canditatePassword, userPassword);
};

userSchema.methods.checkPasswordChanges =  function(TokenTime){
  if(this.passwordChanged){
    const Timeinmin=this.passwordChanged.getTime();
    return Timeinmin<TokenTime;
  }
  return false;
}
userSchema.methods.createPasswordForgotToken= function(){
      const passwordToken=crypto.randomBytes(32).toString('hex');
      this.passwordForgotToken = crypto.createHash('sha256').update(passwordToken).digest('hex');
      this.passwordForgotTokenExpires=Date.now()+(10*60*1000);
  return passwordToken;

}

const user = mongoose.model("user", userSchema);
module.exports = user;
