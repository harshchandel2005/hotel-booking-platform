if(process.env.NODE_ENV !== "production") {
  require('dotenv').config();
} 
const express = require('express');
const app = express();
// const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require("path")
const engine = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const listing = require('./routes/listing');
const review = require('./routes/reviews')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user.js');
const userRouter = require('./routes/users.js');
const aiRoutes = require('./routes/aiRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/admin');


app.use(methodOverride('_method'))
app.use(express.json())

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.engine('ejs', engine);
app.use(express.static('public'))
app.use(express.static(path.join(__dirname,"public/css")))

app.set("views",(path.join(__dirname,"views")));
app.set("view engine" ,"ejs")
app.set('layout', 'layouts/boilerplate');

const sessionOption = {
  secret : process.env.SECRET,
  resave : false,
  saveUninitialized : true,
  cookie :{
    httpOnly : true,
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    maxAge : 1000 * 60 * 60 * 24 * 7 // 7 days
  }
};
app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.use((req,res,next) =>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;  
  next();
});

app.use("/listings" ,listing);
app.use("/listings/:id/reviews" ,review)
app.use("/" ,userRouter);
app.use("/",aiRoutes);
app.use('/', bookingRoutes);
app.use('/admin', adminRoutes);




app.all("*",(req,res,next) =>{
  next(new ExpressError (404 , "Page not found"))
})

app.use((err,req,res,next) =>{
  let {statusCode = 500 , message = "Something went wrong"} = err ;
res.render("./listing/error.ejs" , {message})
})



app.listen("8080",()=>{
    console.log("app started")
})





