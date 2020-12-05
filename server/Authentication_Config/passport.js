const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// load up the user model
const User = require('../models/user');

// load auth api keys
const configAuth = {
  googleAuth: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK,
  },
};

const configMain = (passport) => {
  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(new GoogleStrategy(configAuth.googleAuth, (token, tokenSecret, profile, done) => {
    User.findOne({ 'google.id': profile.id }, (err, user) => {
      if (err) return done(err);
      if (user) return done(null, user);
      // create new user
      const { id, emails, displayName } = profile;
      const newUser = new User({
        google: {
          id,
          token,
          displayName,
          username: emails[0].value,
        },
      });
      newUser.save((saveErr) => {
        if (saveErr) throw saveErr;
        return done(null, newUser);
      });
      return false; // eslint needs return
    });
  }));
};
module.exports = configMain;
