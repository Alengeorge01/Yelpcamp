var mongoose = require("mongoose"),
    passport = require("passport"),
    localstrategy = require("passport-local"),
    passportlocalmongoose = require("passport-local-mongoose");


var userschema =new mongoose.Schema({
   username : {type: String, unique: true, required: true},
   password : String,
   avatar: String,
   firstname : String,
   lastname: String,
   email:{type: String, unique: true, required: true},
   description:String,
   resetPasswordToken: String,
   resetPasswordExpires: Date,
   isAdmin:{
   	type:Boolean,
   	default: false
   }
});

userschema.plugin(passportlocalmongoose);

module.exports = mongoose.model("user" , userschema);