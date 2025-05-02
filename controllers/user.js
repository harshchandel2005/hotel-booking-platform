const User = require('../models/user.js');

module.exports.renderSignUpForm =  (req, res) => {
    res.render('./users/signup.ejs')
};

module.exports.signUp =async (req, res) => {    
   try{const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, function(err) {   
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/listings');    if (err) { return next(err); }
    
    });

}
catch(e){
    req.flash('error', e.message);
    res.redirect('/signup');
}
};

module.exports.renderLoginForm = (req, res) => {
    res.render('./users/login.ejs')
};

module.exports.logIn = async(req, res) => {   
    req.flash("login success");
    res.redirect(res.locals.redirectUrl || '/listings');
};
module.exports.logOut = (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'Goodbye!');
        res.redirect('/listings');
    });
};