var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name:           String,
    secret:         String,
    userId:         String
});

module.exports = mongoose.model('Client', schema);
