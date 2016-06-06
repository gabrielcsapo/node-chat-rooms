var ChatModel = require('../models/chat');
var moment = require('moment');

module.exports = function(app, io, passport) {
    var router = require('socket.io-events')();
    require('./routes')(app, passport);

    io.on('connection', function(socket) {
        socket.on('error', function(error) {
            console.log(error);
        });
    });
    router.on('*:connection', function(socket, args, next) {
        io.emit(args[0], args[1]);
        next();
    });
    router.on('*:message', function(socket, args, next) {
        var room = args[0].substring(0, args[0].indexOf(':'));
        console.log(args);
        ChatModel.findOne({
            name: room
        }, function(err, chat) {
            chat.messages.push(args[1]);
            chat.save();
            args[1].date = moment().format("YYYY-MM-DD HH:mm")
            io.emit(args[0], args[1]);
            next();
        });
    });
    router.on('*:disconnect', function(socket, args, next) {
        io.emit(args[0], args[1]);
        next();
    });
    io.use(router);
};
