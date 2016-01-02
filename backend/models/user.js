var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    password: String,
    email: {
        type: String,
        required: true,
        index: {unique: true}
    },
    score: Number,
    firstName: String,
    lastName: String,
    joinDate: Date,
    avatar: String
});

schema.static('create', function (user, errorOnDuplicate, callback) {
    this.findOne({email: user.email}, function (err, existingUser) {
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

schema.static('createFromRequest', function (request) {
    return new this({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        email: request.body.email,
        password: request.body.password,
        avatar: 'http://api.adorable.io/avatars/250/'
            + request.body.firstName.replace(' ', '')
            + '@'
            + request.body.lastName.replace(' ', '') + '.png',
        joinDate: new Date()
    });
});

module.exports = mongoose.model('User', schema);
