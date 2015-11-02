var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        required: true,
        index: { unique: true }
    },
    password: {
        type: String,
        required: true
    },
    firstName:  String,
    lastName:   String
});

module.exports = mongoose.model('User', schema);
