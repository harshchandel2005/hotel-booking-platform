const Booking = require('../models/Booking');

exports.showBookingForm = (req, res) => {
  res.render('./listing/bookingForm.ejs');
};

exports.createBooking = async (req, res) => {
  try {
    const { name, email, checkIn, checkOut, guests } = req.body;
    
    const newBooking = new Booking({
      name,
      email,
      checkIn,
      checkOut,
      guests,
      listingId: req.params.id 
    });

    await newBooking.save();
    req.flash('success', 'Booking created successfully!');
    res.redirect('/listings');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to create booking');
    res.redirect('back');
  }
};