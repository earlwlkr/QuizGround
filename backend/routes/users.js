var express = require('express');
var router = express.Router();

var User = require('../models/user');
var AccessToken = require('../models/access-token');
var oauth2 = require('../oauth2');


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

            var userId = token.userId;
            User.findById(userId, function (err, user) {
                if (err) {
                    return res.status(400).send(err);
                }

                res.json(user);
            });
        });
    })
    // Update user info.
    .put(function (req, res) {
        User.findOneAndUpdate(
            {_id: req.params.id},
            User.updateFromRequest(req),
            function (err) {
                if (err)
                    return res.status(400).send(err);
                res.json({message: 'User modified!'});
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
