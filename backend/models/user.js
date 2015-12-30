var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    password:   String,
    email: {
        type: String,
        required: true,
        index: { unique: true }
    },
    firstName:  String,
    lastName:   String
});

schema.static('create', function (user, errorOnDuplicate, callback) {
    this.findOne({ email: user.email }, function (err, existingUser) {
        if (err) {
            return callback(err);
        }
        if (existingUser) {
            if (errorOnDuplicate) {
                return callback({error: true, message: 'Email is already used!'});
            }
            return callback(null, existingUser);
        }
        user.save(function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null, user);
        });
    });
});

module.exports = mongoose.model('User', schema);
