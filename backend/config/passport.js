const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'MISSING_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'MISSING_CLIENT_SECRET',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists based on google_id
      const [existingUsers] = await db.query('SELECT * FROM users WHERE google_id = ?', [profile.id]);
      
      if (existingUsers.length > 0) {
        return done(null, existingUsers[0]);
      }

      // Check if user exists by email
      const email = profile.emails[0].value;
      const [usersByEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

      if (usersByEmail.length > 0) {
        const user = usersByEmail[0];
        // If email exists but no google_id, update it
        await db.query('UPDATE users SET google_id = ? WHERE id = ?', [profile.id, user.id]);
        user.google_id = profile.id;
        return done(null, user);
      }

      // Create new OP Patient automatically
      const full_name = profile.displayName;
      // Temporary password for Google auth users, though they won't use it
      const bcrypt = require('bcryptjs');
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      // Temp phone number since it's required in schema
      const tempPhone = 'G-' + Math.floor(Math.random() * 10000000);

      const [result] = await db.query(
        'INSERT INTO users (full_name, email, phone, password, role, google_id) VALUES (?, ?, ?, ?, ?, ?)',
        [full_name, email, tempPhone, hashedPassword, 'Patient', profile.id]
      );

      const [newUsers] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      return done(null, newUsers[0]);
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
