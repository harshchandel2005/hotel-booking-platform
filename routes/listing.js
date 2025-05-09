const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const {isLoggedIn, isOwner} = require('./middleware.js'); 
const listingController = require('../controllers/listing.js');
const multer  = require('multer');
const {storage} = require('../cloudConfig.js')
const upload = multer({ storage });




  // letter 
  // const validateListing = (req,res,next) =>{
  //   let {error} = listingSchema.validate(req.body);
  //   if(error){
  //     throw new ExpressError(400, result.error);
  //   }
  //   else{
  //     next();
  //   }
  // }


// =================== Listing Route ================== 

router.get("/",wrapAsync( listingController.index ));

router.route("/new")
// ================= Add new Route ============= 
.get(isLoggedIn,listingController.renderNewForm)
// =============== Post request ============== 
.post(isLoggedIn,upload.single('listing[image]'),wrapAsync(listingController.createListing));


router.route("/:id")
// ============ Show route =============
.get(wrapAsync(listingController.showListing))
// ============ Update route ==============
.put(isLoggedIn,isOwner,upload.single('listing[image]'),wrapAsync(listingController.updateListing))
// ============ Delete route ==============
.delete(isLoggedIn,isOwner, listingController.destroyListing);



// ==============Edit route Form =============
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm))

router.get('/', listingController.index);

module.exports = router;