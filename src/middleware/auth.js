var express = require('express');
var router = express.Router();
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var users = require('../../config/application').users;

function findUserByName(name) {
	if (name in users) {
		return {
			name: name, password: users[name]
		}
	} else {
		return null;
	}
}

passport.use(new BasicStrategy({},
  function(name, password, done) {
  	var user = findUserByName(name);
    if (user != null && user.password === password) {
    	return done(null, true);
    } else {
    	return done(null, false);
    }
  }
));

router.use(passport.initialize());

// enforce auth for non-GET requests
router.use(function(req, res, next) {
	if (req.method != 'GET') {
		console.log("auth", req.method);
		passport.authenticate('basic', { session: false })(req, res, next);
	} else {
		next();
	}
});

module.exports = router;