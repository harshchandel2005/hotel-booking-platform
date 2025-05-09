const Listing = require("../models/listing");

module.exports.index = async(req,res,next) =>{
    let allData = await Listing.find({});
        res.render("./listing/index.ejs",{allData});
    };

module.exports.renderNewForm = (req,res,next) =>{
    res.render('./listing/new.ejs');
  };
  module.exports.showListing =  async (req,res,next) =>{
    let {id} = req.params;
    let data = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        strictPopulate: false,
        }
      })
      .populate("owner");
    
    if(!data){
      req.flash("error" , "Listing not found");
      return res.redirect("/listings");
    } 
    
    res.render("./listing/show.ejs" , {data})
    };



    module.exports.createListing = async(req,res,next) =>{
        let imgUrl = req.file.path;
        let imgFilename = req.file.filename;
        let  {title,description,price,filename ,url,location,country} = req.body;
        let user = new Listing({title : title ,description : description, image : {filename : imgFilename , url :imgUrl},price :price ,location :location,country :country});
        user.owner = req.user._id;
        await user.save();
        req.flash("success" , "Successfully created a new listing");
        res.redirect("/listings")
        };

        module.exports.renderEditForm =async(req,res,next) =>{
            let {id} = req.params;
          let data = await Listing.findById(id);
          if(!data){
            req.flash("error" , "Listing not found");
            return res.redirect("/listings");
          }
          let originalImage = data.image.url;
          originalImage = originalImage.replace("/upload", "/upload/h_300,w_250");
          res.render("./listing/edit.ejs" , {data ,originalImage});
          };


module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      location: req.body.location,
      country: req.body.country
    };

    
    if (req.file) {
      updateData.image = {
        url: req.file.path.replace(/\\/g, '/'),
        filename: req.file.filename
      };
    }

    
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    ).exec();

    if (!updatedListing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    
    req.flash("success", "Successfully updated the listing");
    res.redirect(`/listings/${updatedListing._id}`);
  } catch (err) {
    console.error('Update Error:', err);
    req.flash("error", "Failed to update listing");
    res.redirect(`/listings/${req.params.id}/edit`);
  }
};


    module.exports.destroyListing = async (req, res, next) => {
      try {
        let { id } = req.params; 
        let deleteListing = await Listing.findByIdAndDelete(id);
        
        if (!deleteListing) {
          return res.status(404).send("Listing not found");
        }
        req.flash("success" , "Listing is deleted successfully");
        res.redirect("/listings"); 
      } catch (err) {
        next(err); 
      }
    }
    // In your index method or wherever you fetch listings
// In your listing controller (controllers/listing.js)
module.exports.index = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const allData = await Listing.find(query);
    
    res.render('listing/index', { 
      allData,
      search: search || '',
      noResults: search && allData.length === 0 // Add this flag
    });
    
  } catch (err) {
    console.error(err);
    req.flash('error', 'Search failed');
    res.redirect('/listings');
  }
};