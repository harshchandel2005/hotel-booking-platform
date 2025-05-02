const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const { isLoggedIn, isReviewAuthor } = require("./middleware");
const reviewController = require('../controllers/review')

// validating review
const validateReview = (req,res,next) =>{
  let {error} = Review.validate(req.body.reviews);
  if(error){
    throw new ExpressError(400, error);
  }
  else{
    next();
  }
}



//Review post route 
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));
// ===============Review Delete Route ===============

router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));
 
   
   router.all("*",(req,res,next) =>{
     next(new ExpressError (404 , "Page not found"))
   })
   
  
  
  module.exports = router;