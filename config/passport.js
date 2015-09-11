// config/passport.js

// load all the things we need
var GitHubStrategy = require('passport-github').Strategy; //GitHub OAuth support

// load up the user model
var user            = require('../models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    // in this case, 'user' is the entire GitHub profile
    passport.serializeUser(function(user, done) {
      console.log('Serializing user: ' + user.displayName);
      done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
      console.log('Deserializing user: ' + user.displayName);
      done(null, user);
    });

    // =========================================================================
    // GITHUB SSO ==============================================================
    // =========================================================================
    // we are using named strategies
    
    passport.use(new GitHubStrategy({
        clientID: appConfig.auth.clientID,
        clientSecret: appConfig.auth.clientSecret,
        callbackURL: appConfig.auth.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        profile.accessToken = accessToken;
        user.token    = accessToken;
        user.id       = profile.id;
        user.username = profile.userName;
        user.name     = profile.displayName;
        profile.user  = user;
        return done(null, profile);
      });
    }
    ));
};
