var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    username:   String,
    password:   String,
    name:       String
});

module.exports = mongoose.model('User', schema);
