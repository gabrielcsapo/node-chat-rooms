var moment = require('moment');

module.exports = function(app, io, passport) {
    var router = require('socket.io-events')();

    io.on('connection', function (socket) {
      socket.on('error', function(error) {
        console.log(error);
      });
    });
    router.on('*:connection', function (socket, args, next) {
        console.log(args);
        io.emit(args[0], args[1]);
    });
    router.on('*:message', function (socket, args, next) {
        args[1].date = moment().format('LT');
        io.emit(args[0], args[1]);
    });
    router.on('*:disconnect', function (socket, args, next) {
        console.log(args);
    });
    io.use(router);

    var routes = require('./routes')(app, passport);

}
