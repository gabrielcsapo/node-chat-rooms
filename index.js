var app = require('express')();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var port = process.env.PORT || 3000;
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
app.set('views', './app');
app.set('view engine', 'pug');
app.logger = logger;

var server = require('http').Server(app);
var io = require('socket.io')(server);
require('./api')(app, io);

server.listen(port, function() {
    console.log('chatter listening on http://localhost:%s', port);
});

module.exports = app;
