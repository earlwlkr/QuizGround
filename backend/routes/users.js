var express = require('express');
var router = express.Router();

var User = require('../models/user');

function getUserFromRequestBody(requestBody) {
    return {
        firstName:  requestBody.firstName,
        lastName:   requestBody.lastName,
        email:      requestBody.email,
        password:   requestBody.password
    };
}

// Routing for /users
router.route('/')
    // Get all users.
    .get(function (req, res) {
        User.find(function (err, results) {
            if (err) {
                res.send(err);
            }

            res.json(results);
        });
    })
    // Create a user.
    .post(function (req, res) {
        var user = new User(getUserFromRequestBody(req.body));
        User.create(user, true, function (err, createdUser) {
            if (err) {
                return res.json(err);
            }
            res.json({message: 'User created!', data: createdUser});
        });
    });

router.route('/:id')
    // Get user info by id.
    .get(function (req, res) {
        User.findOne({_id: req.params.id}, function (err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
    })
    // Update user info.
    .put(function (req, res) {
        User.findOneAndUpdate(
            {_id: req.params.id},
            getUserFromRequestBody(req.body),
            function (err) {
                if (err)
                    res.send(err);
                res.json({message: 'User modified!'});
            }
        );
    })
    // Delete user.
    .delete(function (req, res) {
        User.findOneAndRemove({_id: req.params.id}, function (err) {
            if (err)
                res.send(err);
            res.json({message: 'User deleted!'});
        });
    });

module.exports = router;
