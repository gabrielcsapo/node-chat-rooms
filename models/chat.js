var mongoose = require('mongoose');

var Chat = mongoose.Schema({
    owners: Array, // array of owner ids
    name: String,
    messages: Array
});

module.exports = mongoose.model('Chat', Chat);
