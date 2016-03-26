module.exports = function(app, io) {
    var router = require('socket.io-events')();

    var db = require('../lib/db').connection
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log("we're connected!");
    });

    io.on('connection', function (socket) {
      console.log('hello');
    });
    router.on('*:message', function (socket, args, next) {
        console.log(args);
        console.log('message');
    });
    router.on('*:disconnect', function (socket, args, next) {
        console.log('disconnect');
    });
    io.use(router);

    var routes = require('./routes')(app);

}
