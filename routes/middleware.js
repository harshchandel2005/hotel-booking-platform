const Listing = require('../models/listing');   
const Review = require('../models/review');
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be signed in first');
        return res.redirect('/login');
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}   

module.exports.isOwner = async (req, res, next) => {    
    let {id} = req.params;
    let listing = await Listing.findById(id);
if(!listing.owner.equals(req.user._id)){
  req.flash("error" , "You are not authorized to edit this listing");
  return res.redirect(`/listings/${id}`);
}
next()
};

module.exports.isReviewAuthor = async (req, res, next) => {    
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    
    if (!review.author.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not authorized to delete this review");  
      return res.redirect(`/listings/${id}`);
    }
    
    next();
  };

//   module.exports.validateReview = (req,res,next) =>{
//     let {error} = Review.validate(req.body.reviews);
//     if(error){
//       throw new ExpressError(400, error);
//     }
//     else{
//       next();
//     }
//   };
  