var express = require('express');
var router = express.Router();

var Client = require('../models/client');

// Routing for /clients
router.route('/')
    // Get all quizzes.
    .get(function (req, res) {
        Client.find(function (err, results) {
            if (err) {
                res.send(err);
            }

            res.json(results);
        });
    })
    // Create a client.
    .post(function (req, res) {
        var client = new Client();
        client.name = req.body.name;
        client.secret = req.body.secret;
        client.userId = req.body.userId;
        client.save(function (err) {
            if (err) {
                res.send(err);
            }

            res.json({message: 'Client created!'});
        });
    });

module.exports = router;
