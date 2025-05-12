const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const User = require('../models/user');

// Admin authentication middleware
const isAdmin = (req, res, next) => {
  // Simple hardcoded auth for demo (replace with proper auth in production)
  if (req.body.username === 'admin' && req.body.password === '123') {
    req.session.isAdmin = true;
    return next();
  }
  res.status(401).send('Unauthorized');
};

// Admin login view
router.get('/login', (req, res) => {
  res.render('admin/login');
});

// Admin login handler
router.post('/login', isAdmin, (req, res) => {
  res.redirect('/admin/dashboard');
});

// Admin dashboard
router.get('/dashboard', (req, res) => {
  if (!req.session.isAdmin) return res.redirect('/admin/login');
  res.render('admin/dashboard');
});

// Protected admin routes
router.use((req, res, next) => {
  if (!req.session.isAdmin) return res.redirect('/admin/login');
  next();
});

// List all listings
router.get('/listings', async (req, res) => {
  const listings = await Listing.find({});
  res.render('admin/listings', { listings });
});

// List all users
router.get('/users', async (req, res) => {
  const users = await User.find({});
  res.render('admin/users', { users });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});
// Add this route to your admin routes
router.post('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    req.flash('success', 'User status updated');
    res.redirect('/admin/users');
  } catch (err) {
    req.flash('error', 'Error updating user');
    res.redirect('/admin/users');
  }
});

module.exports = router;