const http = require('http');

const hostname = '127.0.0.3';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
});




var express = require("express"),
    app = express(),
    bodyparser=require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    methodoverride = require("method-override"),
    passport = require("passport"),
    cookieparser = require("cookie-parser"),
    localstrategy = require("passport-local"),
    passportlocalmongoose = require("passport-local-mongoose"),
    campground = require("./models/campground"),
    session = require("express-session"),
    seedDB = require("./seeds"),
    user = require("./models/user"),
    comment = require("./models/comment");

require('dotenv').load();
// require('dotenv').config();
var commentRoutes  = require("./routes/comments"),
    campgroundRoutes  = require("./routes/campgrounds"),
    authRoutes  = require("./routes/auth");


app.use(require("express-session")({
    secret  : "admin",
    resave : false,
    saveUninitialized : false
}));

 var url = process.env.DATABASEURL || "mongodb://localhost/yelpcamp";
mongoose.connect(url);
app.set("view engine" , "ejs");

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.use(methodoverride("_method"));
app.use(flash());
app.use(cookieparser('secret'));
app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req ,res,next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});


//seedDB();

app.use(authRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);


app.listen(port, hostname, () => {
  console.log(`Yelpcamp Server running at http://${hostname}:${port}/`);
});











