var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    userId:             String,
    clientId:           String,
    accessToken:        String,
    expirationDate:     Date
});

module.exports = mongoose.model('AccessToken', schema);
