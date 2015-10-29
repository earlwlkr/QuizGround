var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    userId:         String,
    clientId:       String,
    accessToken:    String
});

module.exports = mongoose.model('AccessToken', schema);
