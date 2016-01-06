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
    avatar: String,
    birthDay: Date
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
        avatar: 'http://api.adorable.io/avatars/200/'
            + request.body.firstName.replace(' ', '')
            + '@'
            + request.body.lastName.replace(' ', '') + '.png',
        joinDate: new Date(),
        birthDay: new Date(request.body.birthDay),
        score: 0
    });
});

schema.static('updateFromRequest', function (request) {
    var user = {};
    if (request.body.firstName) {
        user.firstName = request.body.firstName;
    }
    if (request.body.lastName) {
        user.lastName = request.body.lastName;
    }
    if (request.body.password) {
        user.password = request.body.password;
    }
    if (request.body.avatar) {
        user.avatar = request.body.avatar;
    }
    if (request.body.birthDay) {
        user.birthDay = request.body.birthDay;
    }
    console.log(user);
    return user;
});

module.exports = mongoose.model('User', schema);
