var openBadge = require('openbadge');
var ChatModel = require('../../models/chat');

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.redirect_uri = req.originalUrl;
  res.redirect('/login');
}

module.exports = function(app, passport) {
    app.get('/', function(req, res) {
        res.send('homepage');
    });
    app.get('/redirect', function(req, res) {
        res.redirect(req.session.redirect_uri);
    });
    app.get('/login', function(req, res) {
        if (req.query.redirect_uri) {
            req.session.redirect_uri = req.query.redirect_uri;
        } else {
            req.session.redirect_uri = req.session.redirect_uri || '/'
        }
        res.render('login', {});
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/redirect',
        failureRedirect : '/login'
    }));
    app.get('/signup', function(req, res) {
        if (req.query.redirect_uri) {
            req.session.redirect_uri = req.query.redirect_uri;
        } else {
            req.session.redirect_uri = req.session.redirect_uri || '/'
        }
        res.render('signup', {});
    });
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/redirect',
        failureRedirect : '/signup'
    }));
    app.get('/profile', isAuthenticated, function(req, res) {
        res.render('profile', {user: req.user});
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
                    res.send({error: err.toString()});
                }
                res.redirect('/profile');
            });
        } else {
            res.send({error: 'please specifiy a room'});
        }
    });
    app.get('/:room.svg', function(req, res){
        var room = req.params.room;
        openBadge({
            text: ['chatter', room],
            color:{
                left:"#626262",
                right:"#0188b3",
                font:"#fff",
                shadow:"#fff"
            },
            font: {
                fontFace: '../../assets/fonts/Open_Sans/OpenSans-Regular.ttf'
            },
        }, function (err, badgeSvg) {
            res.set('Content-Type', 'image/svg+xml');
            res.send(badgeSvg);
        });
    });
    app.get('/:room', function(req, res){
        var room = req.params.room;
        ChatModel.findOne({name: room}, function(err, chat) {
            if (chat) {
                res.render('room', {title: room, room: room, user: req.user});
            } else {
                res.render('404', {});
            }
        })
    });
}
