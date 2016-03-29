var mongoose = require('mongoose');

var Chat = mongoose.Schema({
    owners: Array, // array of owner ids
    name: String
});

module.exports = mongoose.model('Chat', Chat);
