var openBadge = require('openbadge');
var RSS = require('rss');
var moment = require('moment');
var chance = require('chance')();
var ChatModel = require('../../models/chat');
var UserModel = require('../../models/user');
var basicAuth = require('basic-auth');

var isAuthenticated = function(req, res, next) {
    function unauthorized(res) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Authorization Needed"');
        res.status(401);
        res.render('error', {
            title: 'Internal Service Error',
            error: 'Your account could not be authenticated'
        });
    }

    var auth = basicAuth(req);
    
    if (!auth || !auth.name || !auth.pass) {
        return unauthorized(res);
    }

    UserModel.findOne({
        'local.email': auth.name
    }, function(err, user) {
        if (err || !user || user == null || (user && !user.isPassword(auth.pass))) {
            unauthorized(res);
        } else {
            req.session.user = user;
            req.user = user;
            return next();
        }
    });
};

/**
 * @module Routes
 * @param  {express} app
 * @param  {socket-io} io
 * @return {router} - returns an express router
 */
module.exports = function(app, io) {
    /**
     * @function GET /
     * renders the home route
     */
    app.get('/', function(req, res) {
        res.render('home', req.session);
    });
    /**
     * @function GET /login
     * Renders the login screen
     * If the user is logged in, redirects to profile
     */
    app.get('/login', isAuthenticated, function(req, res) {
        res.redirect('/profile');
    });
    /**
     * @function GET /logout
     * Logs the user out
     */
    app.get('/logout', function(req, res) {
        req.session.destroy(function() {
            res.status(401);
            res.render('error', {
                title: 'You have been logged out',
                error: ''
            });
        });
    });
    /**
     * @function GET /register
     * Paints the register screen
     */
    app.get('/register', function(req, res) {
        var error = req.query.error;
        res.render('register', {
            error: error
        });
    });
    /**
     * @function POST /register
     * @type {string} email - the email the user wants to register with
     * @type {string} password - the password the user wants to use to register with
     */
    app.post('/register', function(req, res) {
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
                user.settings.color = chance.color({
                    format: 'hex'
                });
                user.save(function(err) {
                    if (err) {
                        throw err;
                    }
                    req.session.user = user;
                    return res.redirect('/profile');
                });
            }
        });
    });
    /**
     * @function GET /profile
     * Uses the logged in users id to paint the profile screen
     */
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
    /**
     * @function GET /user/:username/avatar
     * @type {string} username - the name of a username
     * this will retrieve the correct users avatar
     */
    app.get('/user/:username/avatar', function(req, res) {
        var username = req.params.username;
        UserModel.find({
            username: username
        }, function(err, user) {
            res.set('Content-Type', 'image/svg+xml');
            res.send('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="100"><rect fill="' + user[0].settings.color + '" x="0" y="0" width="100" height="100"/></svg>');
        });
    });
    /**
     * @function GET /:room/messages
     * @type {string} room - the name of the room
     * Gets the messages for a specific room
     */
    app.post('/:room/messages', isAuthenticated, function(req, res) {
        var room = req.params.room;
        var message = req.body.message;
        if (room && message) {
            ChatModel.findOne({
                name: room
            }, function(err, chat) {
                if (err) {
                    res.sendStatus(500);
                }
                var data = {
                    username: req.session.user.username,
                    message: message,
                    date: moment().format('YYYY-MM-DD HH:mm')
                };
                chat.messages.push(data);
                chat.save(function(err) {
                    if (err) {
                        res.send({
                            error: err
                        });
                    } else {
                        io.emit(room + ':message', data);
                        res.send({
                            title: chat.name,
                            messages: chat.messages
                        });
                    }
                });
            });
        } else {
            res.sendStatus(500);
        }
    });
    /**
     * @function GET /room/create
     * Shows a page to create a new room
     */
    app.get('/room/create', isAuthenticated, function(req, res) {
        res.render('roomCreate', req.session);
    });
    /**
     * @function POST /room/create
     * @type {string} name - the name of the room
     */
    app.post('/room/create', isAuthenticated, function(req, res) {
        var name = req.body.name;
        var user_id = req.user.id;
        if (name && user_id) {
            ChatModel.createRoom(name, user_id, chance.color({
                format: 'hex'
            }), function(err) {
                if (err) {
                    res.render('roomCreate', {
                        user: req.session.user,
                        error: err.toString()
                    });
                } else {
                    res.redirect('/profile');
                }
            });
        } else {
            res.render('roomCreate', {
                user: req.session.user,
                error: 'please login to create a room'
            });
        }
    });
    /**
     * @function POST /:room/settings
     * @type {string} room - the name of the room
     */
    app.post('/:room/settings', isAuthenticated, function(req, res) {
        var room = req.params.room;
        var color = req.body.color;
        ChatModel.findOne({
            name: room,
            owners: req.user.id
        }, function(err, chat) {
            if (chat) {
                chat.color = color;
                chat.save(function() {
                    res.redirect('/' + room);
                });
            } else {
                res.render('error', {
                    user: req.user,
                    title: 'Not Authorized',
                    error: 'You are not authorized to view this page'
                });
            }
        });
    });
    /**
     * @function GET /:room/settings
     * @type {string} room - the name of the room
     * Paints the settings page for a specific room
     */
    app.get('/:room/settings', isAuthenticated, function(req, res) {
        var room = req.params.room;
        ChatModel.findOne({
            name: room,
            owners: req.user.id
        }, function(err, chat) {
            if (chat) {
                res.render('roomSettings', {
                    user: req.user,
                    chat: chat
                });
            } else {
                res.render('error', {
                    user: req.user,
                    title: 'Not Authorized',
                    error: 'You are not authorized to view this page'
                });
            }
        });
    });
    /**
     * @function GET /:room.svg
     * @type {string} room - the name of a room
     * Sends an svg image representing the name and color of the room
     */
    app.get('/:room.svg', function(req, res) {
        var room = req.params.room;
        ChatModel.findOne({
            name: room
        }, function(err, chat) {
            if (!chat) {
                openBadge({
                    text: ['chatter', 'room does not exist'],
                    color: {
                        left: '#626262',
                        right: '#b64a4a',
                        font: '#fff'
                    },
                    font: {
                        fontFace: '../../node_modules/openbadge/fonts/Open_Sans/OpenSans-Regular.ttf'
                    }
                }, function(err, badgeSvg) {
                    res.set('Content-Type', 'image/svg+xml');
                    res.send(badgeSvg);
                });
            } else {
                openBadge({
                    text: ['chatter', room],
                    color: {
                        left: '#626262',
                        right: chat.color,
                        font: '#fff'
                    },
                    font: {
                        fontFace: '../../node_modules/openbadge/fonts/Open_Sans/OpenSans-Regular.ttf'
                    }
                }, function(err, badgeSvg) {
                    res.set('Content-Type', 'image/svg+xml');
                    res.send(badgeSvg);
                });
            }
        });
    });
    /**
     * @function GET /:room/count.svg
     * @type {string} room - the name of the room
     * Sends a svg badge with the message count of that room
     */
    app.get('/:room/count.svg', function(req, res) {
        var room = req.params.room;
        ChatModel.findOne({
            name: room
        }, function(err, chat) {
            if (!chat) {
                openBadge({
                    text: ['chatter', 'room does not exist'],
                    color: {
                        left: '#626262',
                        right: '#b64a4a',
                        font: '#fff'
                    },
                    font: {
                        fontFace: '../../node_modules/openbadge/fonts/Open_Sans/OpenSans-Regular.ttf'
                    }
                }, function(err, badgeSvg) {
                    res.set('Content-Type', 'image/svg+xml');
                    res.send(badgeSvg);
                });
            } else {
                openBadge({
                    text: [room, 'message count: ' + chat.messages.length],
                    color: {
                        left: '#626262',
                        right: chat.color,
                        font: '#fff'
                    },
                    font: {
                        fontFace: '../../node_modules/openbadge/fonts/Open_Sans/OpenSans-Regular.ttf'
                    }
                }, function(err, badgeSvg) {
                    res.set('Content-Type', 'image/svg+xml');
                    res.send(badgeSvg);
                });
            }
        });
    });
    /**
     * @function GET /:room
     * @type {string} room - the name of the a room
     */
    app.get('/:room', isAuthenticated, function(req, res) {
        var room = req.params.room;
        ChatModel.findOne({
            name: room
        }, function(err, chat) {
            if (chat && !err) {
                res.render('room', {
                    title: room,
                    messages: chat.messages,
                    room: room,
                    user: req.user,
                    owner: req.user ? (chat.owners.indexOf(req.user.id) > -1) : false
                });
            } else {
                res.render('404', {
                    user: req.user
                });
            }
        });
    });
    /**
     * @function GET /:room/json
     * @type {string} room - the name of a room
     * @returns {JSON} Returns a JSON representation of the room
     * @example
     * {
     *  "room": "testing"
     *  "title": "testing",
     *  "messages": [{
     *     "message": "does this work?",
     *     "username": "root",
     *     "date": "2016-06-07 18:34"
     *  }, {
     *     "message": "oh great?",
     *     "username": "root",
     *     "date": "2016-06-07 18:34"
     *  }, {
     *     "message": "this is awesome",
     *     "username": "root",
     *     "date": "2016-06-07 18:40"
     *  }],
     * }
     */
    app.get('/:room/json', isAuthenticated, function(req, res) {
        var room = req.params.room;
        ChatModel.findOne({
            name: room
        }, function(err, chat) {
            if (chat) {
                res.send({
                    title: room,
                    messages: chat.messages || []
                });
            } else {
                res.sendStatus('404');
            }
        });
    });
    /**
     * @function GET /:room/rss
     * @type {string} room - the name of the room
     * Responds with an rss feed to that specific room
     * This can be used to subscribe to any updates that go on in the room
     */
    app.get('/:room/rss', isAuthenticated, function(req, res) {
        var room = req.params.room;
        ChatModel.findOne({
            name: room
        }, function(err, chat) {
            if (chat) {
                var feed = new RSS({
                    title: room,
                    description: 'description',
                    feed_url: 'http://' + req.headers.host + req.originalUrl + '/rss',
                    site_url: 'http://' + req.headers.host
                });
                chat.messages.forEach(function(message) {
                    feed.item({
                        title: message.message,
                        author: message.username,
                        date: moment(message.date).format()
                    });
                });
                var xml = feed.xml({
                    indent: true
                });
                res.send(xml);
            } else {
                res.render('404', {
                    user: req.user
                });
            }
        });
    });
    app.use(function(req, res) {
        res.render('404', {
            user: req.user
        });
    });
};
