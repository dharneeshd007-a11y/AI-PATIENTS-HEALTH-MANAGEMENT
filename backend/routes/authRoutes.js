const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', authController.registerUser);

// POST /api/auth/login
router.post('/login', authController.loginUser);

const passport = require('passport');

// GET /api/auth/google
// Initiates the Google OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback
// Handles the callback from Google
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login?error=true' }),
  authController.googleCallback
);

module.exports = router;
