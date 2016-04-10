var openBadge = require('openbadge');
var ChatModel = require('../../models/chat');
var UserModel = require('../../models/user');

var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.redirect_uri = req.originalUrl;
    res.redirect('/login');
};

var redirectNext = function(req, res, next) {
    if (req.query.redirect_uri) {
        req.session.redirect_uri = req.query.redirect_uri;
    } else {
        req.session.redirect_uri = req.session.redirect_uri || '/';
    }
    next();
};

module.exports = function(app, passport) {
    app.get('/', function(req, res) {
        res.render('homepage', {});
    });
    app.get('/redirect', function(req, res) {
        res.redirect(req.session.redirect_uri);
    });
    app.get('/login', redirectNext, function(req, res) {
        res.render('login', {});
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/redirect',
        failureRedirect: '/login'
    }));
    app.get('/signup', redirectNext, function(req, res) {
        res.render('signup', {});
    });
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/redirect',
        failureRedirect: '/signup'
    }));
    app.get('/profile', isAuthenticated, function(req, res) {
        ChatModel.find({
            owners: req.user.id
        }, function(err, chats) {
            res.render('profile', {
                user: req.user,
                chats: chats
            });
        });
    });
    app.get('/user/:username/avatar', function(req, res) {
        var username = req.params.username;
        UserModel.find({username: username}, function(err, user) {
            res.set('Content-Type', 'image/svg+xml');
            res.send('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="100"><rect fill="' + user[0].settings.color +'" x="0" y="0" width="100" height="100"/></svg>');
        });
    });
    app.get('/room/create', isAuthenticated, function(req, res) {
        res.render('roomCreate', {});
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
    app.get('/:room', function(req, res) {
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
