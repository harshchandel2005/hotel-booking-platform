const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary'); 
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,  //in config the key name is always cloud_name,api_key,api_secret
    api_key :process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET
})
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'project_dev',
      allowedFormats: ["png","jpg","jpeg"] 
    },
  });
  module.exports = {
    cloudinary,
    storage
  }