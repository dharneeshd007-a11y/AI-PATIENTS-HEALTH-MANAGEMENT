const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'MISSING_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'MISSING_CLIENT_SECRET',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists based on google_id
      const [existingUsers] = await db.query('SELECT * FROM users WHERE google_id = ?', [profile.id]);
      
      if (existingUsers.length > 0) {
        const user = existingUsers[0];
        if (user.role === 'Patient') {
          return done(new Error('Access Denied. Patients cannot use Google Sign-In.'), null);
        }
        return done(null, user);
      }

      // Check if user exists by email
      const email = profile.emails[0].value;
      const [usersByEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

      if (usersByEmail.length > 0) {
        const user = usersByEmail[0];
        if (user.role === 'Patient') {
          return done(new Error('Access Denied. Patients cannot use Google Sign-In.'), null);
        }
        // If email exists but no google_id, update it
        await db.query('UPDATE users SET google_id = ? WHERE id = ?', [profile.id, user.id]);
        user.google_id = profile.id;
        return done(null, user);
      }

      // If user does not exist in the database at all
      return done(new Error('Access Denied. Contact the Administrator.'), null);
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
