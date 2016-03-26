var app = require('express')();
app.set('views', './app')
app.set('view engine', 'jade');

var server = require('http').Server(app);
var io = require('socket.io')(server);
var api = require('./api')(app, io);

server.listen(process.env.PORT || 3000, function() {
    console.log('chatter listening on localhost:', server.address().port)
});
