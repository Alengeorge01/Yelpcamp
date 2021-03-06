var express = require("express");
var router = express.Router();
var campground = require("../models/campground");
var comment = require("../models/comment");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'djerw2pfo', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

router.get("/" , function(req,res){
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              if(allCampgrounds.length < 1) {
                  noMatch = "No campgrounds match that search, please try again.";
              }
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    }
    else{
        campground.find({} , function(err, allcampgrounds){
        if(err){
            console.log(err);
        }
        else{
            res.render("campgrounds/index", {campgrounds:allcampgrounds , currentUser:req.user , noMatch: noMatch});
        }
    });
    }
    
});

router.get("/", function(req, res){
    campground.find({}, function(err, allcampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds: allcampgrounds, page: 'campgrounds'});
       }
    });
});

router.post("/", middleware.isloggedin, upload.single('image'), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
    req.body.campground.image = result.secure_url;
    req.body.campground.author = {
      id: req.user._id,
      username: req.user.username
    }
    campground.create(req.body.campground, function(err, campground) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      res.redirect('/campgrounds/' + campground.id);
    });
  });
});

router.get("/new", middleware.isloggedin, function(req, res) {
    res.render("campgrounds/new");
});

router.get("/:id" ,function(req, res) {
    campground.findById(req.params.id).populate("comments").exec(function(err , foundCampground){
        if(err){
            console.log(err);
        }
        else{
            res.render("campgrounds/show", {campground : foundCampground});
        }
    });

});

router.get("/:id/edit" , middleware.checkcampground,function(req,res){
    campground.findById(req.params.id , function(err , foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});     
    });
});

router.put("/:id" ,middleware.checkcampground, function(req,res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});


router.delete("/:id" ,middleware.checkcampground, function(req,res){
campground.findByIdAndRemove(req.params.id, function(err){
    if(err){
            res.redirect("/campgrounds");
        }
        else{
            res.redirect("/campgrounds");
        }
});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;

