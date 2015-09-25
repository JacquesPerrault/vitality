// app/routes.js
module.exports = function(app, passport) {
  var Promise         = require('promise');
  var mysql           = require('mysql');
  var config          = appConfig;
  var DateTime        = require('date-time-string');
  //var ibmdb           = require('ibm_db');

  // sample odbc string for DB2
/*  var odbc_string     = 'DRIVER={DB2};DATABASE=' + config.VCAP_SERVICES.db +
             ';HOSTNAME=' + config.VCAP_SERVICES.hostname +
             ';UID=' + config.VCAP_SERVICES.username +
             ';PWD=' + config.VCAP_SERVICES.password +
             ';PORT=' + config.VCAP_SERVICES.port +
             ';PROTOCOL=TCPIP'*/


  // ******************************************************************************************
  // This script is released to the public domain and may be used, modified and
  // distributed without restrictions. Attribution not necessary but appreciated.
  // Source: http://weeknumber.net/how-to/javascript

  // Returns the four-digit year corresponding to the ISO week of the date.
  Date.prototype.getWeekYear = function() {
    var date = new Date(this.getTime());
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
  }
  // ******************************************************************************************

  // =====================================
  // LOG ALL REQUESTS ====================
  // =====================================
  app.all('*', function(req, res, next) {
    // Use Application Registration instead of SSO
    // To enable SSO, uncomment the line below, and set useAuth (server.js) to true
    //useAuth = (req.host === 'localhost') ? false : true;
    console.log(DateTime.toDateTimeString(Date.now()) + " - remote ip: " + req.connection.remoteAddress + " received request to " + req.url);
    next();
  });


  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================
  //app.get('/', isLoggedIn, function(req, res) {
  app.get('/', function(req, res) {
    res.render('index.ejs',  {profile: req.session.passport.user, // get the user out of session and pass to template
                             authenticated: req.isAuthenticated(),
                             useAuth: useAuth
    });
  });



  // =====================================
  // STATUS PAGE =========================
  // =====================================
  //app.get('/index1', isLoggedIn, function(req, res) {
  app.get('/status', function(req, res) {
    res.render('status.ejs',  {profile: req.session.passport.user, // get the user out of session and pass to template
                             authenticated: req.isAuthenticated(),
                             useAuth: useAuth
    });
  });



  // =====================================
  // TEST PAGE =========================
  // =====================================
  //app.get('/vitality', isLoggedIn, function(req, res) {
  app.get('/vitality', function(req, res) {
    res.render('vitalityscatter.ejs',  {profile: req.session.passport.user, // get the user out of session and pass to template
                             authenticated: req.isAuthenticated(),
                             useAuth: useAuth
    });
  });



  // =====================================
  // LOGIN ===============================
  // =====================================

  // Redirect the user to the OAuth provider for authentication.  When
  // complete, the provider will redirect the user back to the application at
  // /auth/openworks/callback
  app.get('/auth/openworks', passport.authenticate('github', { 
      response_type: 'code',
      redirect_uri: config.auth.callbackURL,
      client_id: config.auth.consumerKey,
      scope: '',
      state: config.auth.state
  }));


  // The OAuth provider has redirected the user back to the application.
  // Finish the authentication process by attempting to obtain an access
  // token.  If authorization was granted, the user will be logged in.
  // Otherwise, authentication has failed.
  app.get('/auth/openworks/callback', 
    passport.authenticate('github', {
      successRedirect: '/', // redirect to the homepage
      failureRedirect: '/', // redirect back to the login page if there is an error
      failureFlash : true // allow flash messages
  }));

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });
  
  
  // route middleware to make sure a user is logged in
  function isLoggedIn(req, res, next) {

      // if user is authenticated in the session, carry on 
      if (req.isAuthenticated())
          return next();

      // if they aren't redirect them to the login page
      res.redirect('/', { authenticated: false});
  }

};
