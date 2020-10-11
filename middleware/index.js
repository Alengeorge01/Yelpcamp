var campground = require("../models/campground");
var comment = require("../models/comment");
var user = require("../models/user");

var middlewareobj ={};

middlewareobj.checkcampground = function(req,res,next){
	    if(req.isAuthenticated()){
        campground.findById(req.params.id , function(err , foundCampground){
        if (err) {
            req.flash("error" , "Campground not found !!");
            res.redirect("back");
        }
        else {
            if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){  
                next();
            }
            else{
                req.flash("error" , "You don't have permission to do that !!"); 
                 res.redirect("back");
            }
        }
    });
    }
    else{
        res.redirect("back");
    }
}
middlewareobj.checkcomment = function(req,res,next){
	 if(req.isAuthenticated()){
        comment.findById(req.params.comment_id , function(err , foundComment){
        if (err) {
            res.redirect("back");
        }
        else {
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){  
                next();
            }
            else{
                req.flash("error" , "You don't have permission to do that !!"); 
                 res.redirect("back");
            }
        }
    });
    }
    else{
        req.flash("error" , "You need to be logged in to do that !!"); 
        res.redirect("back");
    }
}

middlewareobj.isloggedin = function(req,res,next){
	 if(req.isAuthenticated()){
        return next();
    }
    req.flash("error" , "You need to be Logged In to do that !!");
    res.redirect("/login");
}


module.exports = middlewareobj;

