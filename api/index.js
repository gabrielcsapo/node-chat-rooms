module.exports = function(app, io, passport) {
    var router = require('socket.io-events')();

    var db = require('../lib/db').connection
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log("we're connected!");
    });
    io.on('connection', function (socket) {
      socket.on('error', function(error) {
        console.log(error);
      });
    });
    router.on('*:connection', function (socket, args, next) {
        console.log(args);
        io.emit(args[0], args[1] + ' has connected');
    });
    router.on('*:message', function (socket, args, next) {
        console.log(args);
        io.emit(args[0], args[1]);
    });
    router.on('*:disconnect', function (socket, args, next) {
        console.log(args);
    });
    io.use(router);

    var routes = require('./routes')(app, passport);

}
