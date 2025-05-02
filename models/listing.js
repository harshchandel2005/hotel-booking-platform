const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/project');
}
const listingSchema  = mongoose.Schema({
    title : {
        type : String ,
        require : true
    },
    description : String,
    image: {
        url : String,
        filename : String,
    },
    price : Number,
    location : String,
    country : String ,
reviews : [
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Review",
    },
],
owner : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
},
})
const Listing = mongoose.model("Listing" , listingSchema);
module.exports = Listing;