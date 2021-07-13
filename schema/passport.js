const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const { Strategy: GoogleTokenStrategy } = require('passport-token-google');
require('dotenv').config();


// FACEBOOK STRATEGY
const FacebookTokenStrategyCallback = (accessToken, refreshToken, profile, done) => done(null, {
    accessToken,
    refreshToken,
    profile,
});

passport.use(new FacebookTokenStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID /* '262319249001254' */,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET /* 'ba84e931222689bd95ce5393110ee797' */,
}, FacebookTokenStrategyCallback));

// GOOGLE STRATEGY
const GoogleTokenStrategyCallback = (accessToken, refreshToken, profile, done) => done(null, {
    accessToken,
    refreshToken,
    profile,
});

passport.use(new GoogleTokenStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID /* '864664905033-de7mcecde9jbfkapmt97m8e4dh4rks20.apps.googleusercontent.com' */,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET/* 'BM94M7Sg_cRJ-EVjuMs1fUeT' */,
}, GoogleTokenStrategyCallback));

const authenticateFacebook = (req, res) => new Promise((resolve, reject) => {
    passport.authenticate('facebook-token', { session: false }, (err, data, info) => {
        if (err) reject(err);
        resolve({ data, info });
    })(req, res);
});

const authenticateGoogle = (req, res) => new Promise((resolve, reject) => {
    passport.authenticate('google-token', { session: false }, (err, data, info) => {
        if (err) reject(err);
        resolve({ data, info });
    })(req, res);
});

module.exports = { authenticateFacebook, authenticateGoogle };