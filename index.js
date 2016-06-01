var app = require('express')();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var logger = require('bunyan').createLogger({name: 'chatter'});
var db = mongoose.connection;

db.on('error', function(err) { throw err; });

mongoose.connect('mongodb://localhost:27017/chatter');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'magicmouse',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
require('./models/passport')(passport);
app.set('views', './app');
app.set('view engine', 'jade');
app.logger = logger;

var server = require('http').Server(app);
var io = require('socket.io')(server);
require('./api')(app, io, passport);

server.listen(process.env.PORT || 3000, function() {
    console.log('chatter listening on localhost:', server.address().port);
});
