// main authentication router
const isLoggedIn = require('./isloggedin');

const authRoutes = (app, passport) => {
// wether a user is logged in or not json data will show up on the profile page
  app.get('/auth/profile', isLoggedIn, (req, res) => {
    const headerObject = req.headers; // need for ip
    let ip = (headerObject['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    ip = (ip === '::1') ? 'local' : ip;
    let service = Object.keys(req.user._doc).filter(s => s !== '__v' && s !== '_id');
    [service] = service.filter(s => Object.keys(req.user._doc[s]).length);
    if(req.user[service].username === 'Guest'){
      res.json({
        authenticated: false,
        userip: ip,
        username: 'Guest',
        displayname: 'Guest',
      });
    }
    res.json({
      authenticated: true,
      userip: ip,
      username: req.user[service].username,
      userID: req.user[service].id,
      displayname: req.user[service].displayName,
      service,
    });
  });

  // route for logging out
  app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  // login route
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  // redirect from google
  app.get('/auth/google/redirect',
    passport.authenticate('google', {
      successRedirect: '/',
      failureRedirect: '/',
    }));
  // logout route
};

module.exports = authRoutes;
