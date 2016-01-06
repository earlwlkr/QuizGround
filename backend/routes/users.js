var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Quiz = require('../models/quiz');
var AccessToken = require('../models/access-token');
var oauth2 = require('../oauth2');

function getUserPublicInfo(user) {
    return {
        _id: user._id.toString(),
        email: user.email,
        score: user.score,
        firstName: user.firstName,
        lastName: user.lastName,
        joinDate: user.joinDate,
        avatar: user.avatar,
        birthDay: user.birthDay,
        isAdmin: user.isAdmin
    };
}

// Routing for /users
router.route('/')
    // Get all users.
    .get(function (req, res) {
        User.find(function (err, results) {
            if (err) {
                return res.status(400).send(err);
            }

            res.json(results);
        });
    })
    // Create a user.
    .post(function (req, res) {
        var user = User.createFromRequest(req);
        User.create(user, true, function (err, createdUser) {
            if (err) {
                return res.status(400).json(err);
            }
            res.json({message: 'User created!', data: createdUser});
        });
    });

router.route('/:id')
    // Get user info by id.
    .get(oauth2.isAuthenticated, function (req, res) {
        AccessToken.findOne({accessToken: req.params.id}, function (err, token) {
            if (err) {
                return res.status(400).send(err);
            }
            if (!token) {
                User.findById(req.params.id, function (err, user) {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    if (!user) {
                        return res.status(400).send('User not found');
                    }

                    res.json(getUserPublicInfo(user));
                });
            } else {
                var userId = token.userId;
                User.findById(userId, function (err, user) {
                    if (err) {
                        return res.status(400).send(err);
                    }

                    res.json(getUserPublicInfo(user));
                });
            }
        });
    })
    // Update user info.
    .put(function (req, res) {
        var updatedUser = User.updateFromRequest(req);
        User.findOneAndUpdate(
            {_id: req.params.id},
            updatedUser,
            function (err) {
                if (err) {
                    return res.status(400).send(err);
                }
                Quiz.find({'creator._id': req.params.id}).exec(function (err, results) {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    for (var i = 0; i < results.length; i++) {
                        results[i].creator = updatedUser;
                        results[i].save();
                    }

                    res.json({message: 'User modified!'});
                });
            }
        );
    })
    // Delete user.
    .delete(function (req, res) {
        User.findOneAndRemove({_id: req.params.id}, function (err) {
            if (err)
                return res.status(400).send(err);
            res.json({message: 'User deleted!'});
        });
    });

module.exports = router;
