var mongoose = require("mongoose");
var campground = require("./models/campground");
var comment   = require("./models/comment");


function seedDB(){
    campground.remove({} , function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("Campgrounds Removed");
        }
    });
    comment.remove({} , function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("Campgrounds Removed");
        }
    });
}

module.exports = seedDB;