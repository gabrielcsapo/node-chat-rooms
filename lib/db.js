var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatter');

module.exports = mongoose;
