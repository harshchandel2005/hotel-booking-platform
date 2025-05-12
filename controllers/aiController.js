const geminiModel = require('../models/geminiModel');

const aiController = {
  showForm: (req, res) => {
    try {
      res.render('ai/form', { 
        currUser: req.user,
        formData: null,
        errors: null
      });
    } catch (err) {
      console.error('Form render error:', err);
      res.status(500).render('error', { 
        message: 'Unable to load the form',
        currUser: req.user 
      });
    }
  },

  getSuggestions: async (req, res) => {
    const { destination, budget, people, travelParty, bookingDate, sourceAddress } = req.body;
    const errors = [];
    const numPeople = parseInt(people, 10);

    // Validate required fields
    if (!destination?.trim()) errors.push('Destination is required');
    if (!budget) errors.push('Budget range is required');
    if (isNaN(numPeople) || numPeople <= 0) errors.push('Valid number of people is required');
    if (!travelParty) errors.push('Travel companion type is required');
    if (!sourceAddress?.trim()) errors.push('Starting location is required');

    if (errors.length > 0) {
      return res.status(400).render('ai/form', {
        currUser: req.user,
        formData: { destination, budget, people, travellingWith: travelParty, bookingDate, sourceAddress },
        errors
      });
    }

    try {
      console.log("Starting suggestion generation..."); // Debug log
      
      const responseText = await geminiModel.generateHotelSuggestions(
        destination.trim(),
        budget,
        numPeople,
        travelParty,
        bookingDate || 'Not specified',
        sourceAddress.trim()
      );
      
      // console.log("Response received, parsing..."); // Debug log
      
      const hotels = geminiModel.parseHotelResponse(responseText);

      if (!hotels || hotels.length === 0) {
        throw new Error('No hotels found matching your criteria');
      }

      // console.log("Rendering suggestions with", hotels.length, "hotels"); // Debug log

      res.render('ai/suggestions', { 
        hotels,
        formData: { 
          destination, 
          budget, 
          people: numPeople, 
          travellingWith: travelParty, 
          bookingDate, 
          sourceAddress 
        },
        currUser: req.user,
        searchParams: {
          from: sourceAddress,
          to: destination,
          date: bookingDate || 'Flexible dates',
          groupSize: numPeople
        }
      });

    } catch (err) {
      console.error('Suggestion generation error:', err);
      res.status(500).render('ai/form', {
        currUser: req.user,
        formData: { 
          destination, 
          budget, 
          people: numPeople, 
          travellingWith: travelParty, 
          bookingDate, 
          sourceAddress 
        },
        errors: ['We couldn\'t generate suggestions. Please try again with different parameters.']
      });
    }
  }
};

module.exports = aiController;