var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var port = process.env.PORT || 3000;
var logger = require('bunyan').createLogger({name: 'chatter'});
var db = mongoose.connection;

db.on('error', function(err) { throw err; });

var uri = process.env.MONGO_URL;

mongoose.connect(uri.toString());

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'magicmouse',
    resave: true,
    saveUninitialized: true
}));
app.set('views', './views');
app.set('view engine', 'pug');
app.use('/font-awesome', express.static('node_modules/font-awesome'));

var server = require('http').Server(app);
var io = require('socket.io')(server);
require('./api')(app, io, logger);

server.listen(port, function() {
    logger.info('chatter listening on http://localhost:%s', port);
});

module.exports = server;
