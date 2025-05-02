const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.get('/', (req, res) => res.redirect('/form'));
router.get('/form', aiController.showForm);
router.post('/suggest-hotels', aiController.getSuggestions);

module.exports = router;