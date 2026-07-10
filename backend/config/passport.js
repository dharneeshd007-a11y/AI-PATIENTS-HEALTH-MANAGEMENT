const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'MISSING_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'MISSING_CLIENT_SECRET',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    proxy: true,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const role = req.query.state; // 'admin' or 'doctor'

      
      // Admin Flow
      if (role === 'admin') {
        if (email === 'dharneeshd007@gmail.com') {
          return done(null, { id: 9999, full_name: 'System Admin', email: email, role: 'Admin', phone: '7904138308' });
        } else {
          return done(new Error('This Google account is not the Administrator account.'), null);
        }
      }

      // Doctor Flow
      if (role === 'doctor') {
        // Prevent Administrator from logging into Doctor dashboard
        if (email === 'dharneeshd007@gmail.com') {
          return done(new Error('Administrators must use the Admin Portal.'), null);
        }

        const [usersByEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (usersByEmail.length > 0) {
          const user = usersByEmail[0];
          if (user.role !== 'Doctor') {
            return done(new Error('Access Denied. Only registered Doctors can use this portal.'), null);
          }
          if (!user.google_id) {
            await db.query('UPDATE users SET google_id = ? WHERE id = ?', [profile.id, user.id]);
            user.google_id = profile.id;
          }
          return done(null, user);
        }

        // Check if user is in `approved_doctors` (Pending Registration)
        try {
          const [approvedDoctors] = await db.query('SELECT * FROM approved_doctors WHERE email = ?', [email]);
          if (approvedDoctors.length > 0) {
            return done(new Error('Please complete your account registration before logging in.'), null);
          }
        } catch (err) {
          // Table might not exist yet
        }

        return done(new Error('Your email is not registered by the Administrator.'), null);
      }

      // Default / unknown flow
      return done(new Error('Invalid portal type selected.'), null);
    } catch (err) {
      console.error('Google Strategy Error:', err);
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, users[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
