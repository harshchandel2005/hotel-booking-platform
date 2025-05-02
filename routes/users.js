const express = require('express');
 const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const { saveRedirectUrl } = require('./middleware.js');
const userController = require('../controllers/user.js')


// sign up  
router.route('/signup')
.get(userController.renderSignUpForm)
.post(wrapAsync(userController.signUp));


// login route 
router.route('/login')
.get(userController.renderLoginForm)
.post(saveRedirectUrl,passport.authenticate("local" , {failureRedirect : '/login' ,failureFlash : true}),userController.logIn);  

// Log out route
router.get('/logout',userController.logOut )


 module.exports = router;