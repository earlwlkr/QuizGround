var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    userId:         String,
    clientId:       String,
    refreshToken:   String
});

module.exports = mongoose.model('RefreshToken', schema);
