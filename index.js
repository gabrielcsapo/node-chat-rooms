var app = require('express')();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");
});

mongoose.connect(require('./config/db.js').url);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: 'magicmouse'}));
app.use(passport.initialize());
app.use(passport.session());
require('./models/passport')(passport);
app.set('views', './app')
app.set('view engine', 'jade');

var server = require('http').Server(app);
var io = require('socket.io')(server);
var api = require('./api')(app, io, passport);

server.listen(process.env.PORT || 3000, function() {
    console.log('chatter listening on localhost:', server.address().port)
});
