var openBadge = require('openbadge');
var _ = require('underscore');
var ChatModel = require('../../models/chat');
var UserModel = require('../../models/user');
var basicAuth = require('basic-auth-connect');

var isAuthenticated = function(req, res, next) {
    return basicAuth(function(user, pass, done) {
        UserModel.findOne({
            'local.email': user
        }, function(err, user) {
            if (err) {
                return done(err, null);
            }
            if (!user || user == null) {
                return done('No user found.', null);
            }
            if (!user.isPassword(pass)) {
                return done('Oops! Wrong password.', null);
            } else {
                req.session.user = user;
                return done(null, user);
            }
        });
    })(req, res, next);
};

var redirectNext = function(req, res, next) {
    if (req.query.redirect_uri) {
        req.session.redirect_uri = req.query.redirect_uri;
    } else {
        req.session.redirect_uri = req.session.redirect_uri || '/';
    }
    next();
};

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('home', req.session);
    });
    app.get('/redirect', function(req, res) {
        res.redirect(req.session.redirect_uri);
    });
    app.get('/login', isAuthenticated, function(req, res) {
        res.redirect('/profile');
    });
    app.get('/logout', function(req, res) {
        req.session.destroy(function() {
            res.redirect('/');
        });
    });
    app.get('/register', function(req, res) {
        var error = req.query.error;
        res.render('register', {error: error});
    });
    app.post('/register', function(req, res, next) {
        var email = req.body.email;
        var password = req.body.password;

        UserModel.findOne({
            'local.email': email
        }, function(err, _user) {
            if (err) {
                return res.redirect('/register?error=' + err.toString());
            }
            if (_user) {
                return res.redirect('/register?error=That email is already taken');
            } else {
                var user = new UserModel();
                user.username = req.body.username;
                user.local.email = email;
                user.local.password = user.generateHash(password);
                user.settings = {};
                user.settings.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                user.save(function(err) {
                    if (err) {
                        throw err;
                    }
                    req.session.user = user;
                    return next(null, user);
                });
            }
        });
    }, redirectNext);
    app.get('/profile', isAuthenticated, function(req, res) {
        ChatModel.find({
            owners: req.user.id
        }, function(err, rooms) {
            res.render('profile', {
                user: req.user,
                rooms: rooms
            });
        });
    });
    app.get('/user/:username/avatar', function(req, res) {
        var username = req.params.username;
        UserModel.find({
            username: username
        }, function(err, user) {
            res.set('Content-Type', 'image/svg+xml');
            res.send('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="100"><rect fill="' + user[0].settings.color + '" x="0" y="0" width="100" height="100"/></svg>');
        });
    });
    app.get('/room/create', isAuthenticated, function(req, res) {
        res.render('roomCreate', req.session);
    });
    app.post('/room/create', isAuthenticated, function(req, res) {
        if (req.body.room) {
            var chat = new ChatModel();
            chat.owners = [req.user.id];
            chat.name = req.body.room;
            chat.save(function(err) {
                if (err) {
                    res.send({
                        error: err.toString()
                    });
                }
                res.redirect('/profile');
            });
        } else {
            res.send({
                error: 'please specifiy a room'
            });
        }
    });
    app.get('/:room.svg', function(req, res) {
        var room = req.params.room;
        openBadge({
            text: ['chatter', room],
            color: {
                left: '#626262',
                right: '#0188b3',
                font: '#fff',
                shadow: '#fff'
            },
            font: {
                fontFace: '../../app/assets/fonts/Open_Sans/OpenSans-Regular.ttf'
            }
        }, function(err, badgeSvg) {
            res.set('Content-Type', 'image/svg+xml');
            res.send(badgeSvg);
        });
    });
    app.get('/:room', isAuthenticated, function(req, res) {
        var room = req.params.room;
        ChatModel.findOne({
            name: room
        }, function(err, chat) {
            if (chat) {
                res.render('room', {
                    title: room,
                    messages: chat.messages,
                    room: room,
                    user: req.user
                });
            } else {
                res.render('404', {});
            }
        });
    });
};
