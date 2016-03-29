var LocalStrategy = require('passport-local').Strategy;
var User = require('./user');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, email, password, done) {
        process.nextTick(function() {
            User.findOne({
                'local.email': email
            }, function(err, _user) {
                if (err) {
                    return done(err);
                }
                if (_user) {
                    req.error = 'That email is already taken.';
                    return done(null, false);
                } else {
                    var user = new User();
                    user.username = req.body.username;
                    user.local.email = email;
                    user.local.password = user.generateHash(password);
                    user.settings = {};
                    user.settings.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                    user.save(function(err) {
                        if (err) {
                            console.log(err);
                            throw err;
                        }
                        return done(null, user);
                    });
                }
            });
        });
    }));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) { // callback with email and password from our form
        User.findOne({
            'local.email': email
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, req.error = 'No user found.');
            }
            if (!user.isPassword(password)) {
                return done(null, false, req.error = 'Oops! Wrong password.');
            }
            return done(null, user);
        });

    }));
};
