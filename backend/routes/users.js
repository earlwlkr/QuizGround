var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Client = require('../models/client');

function getUserFromRequestBody(requestBody) {
    return {
        firstName:  requestBody.firstName,
        lastName:   requestBody.lastName,
        email:   requestBody.email,
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
        User.findOne({ email: user.email }, function (err, existingUser) {
            if (err) {
                return res.send(err);
            }
            if (existingUser) {
                return res.json({error: true, message: 'Tên đăng nhập này đã tồn tại!'});
            }
            user.save(function (err) {
                if (err) {
                    res.send(err);
                }
                res.json({message: 'User created!', data: user});
            });
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
