var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    userId:                 String,
    clientId:               String,
    authorizationCode:      String,
    redirectUri:            String
});

module.exports = mongoose.model('AuthorizationCode', schema);
