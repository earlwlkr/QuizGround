var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: { unique: true }
    },
    googleId:   String,
    firstName:  String,
    lastName:   String
});

module.exports = mongoose.model('User', schema);
