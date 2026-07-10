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
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (err) {
      // Use /#/login because the frontend uses HashRouter
      return res.redirect(`${frontendUrl}/#/login?error=${encodeURIComponent(err.message)}`);
    }
    if (!user) {
      return res.redirect(`${frontendUrl}/#/login?error=${encodeURIComponent('Authentication failed')}`);
    }
    // No sessions, just set user on req and pass to controller
    req.user = user;
    return authController.googleCallback(req, res);
  })(req, res, next);
});

module.exports = router;
