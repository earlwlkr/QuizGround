var express = require('express');
var router = express.Router();

var Client = require('../models/client');

function getClientFromRequestBody(requestBody) {
    return {
        name: requestBody.name,
        secret: requestBody.secret,
        userId: requestBody.userId
    };
}

router.route('/')
    // Create a client.
    .post(function (req, res) {
        var client = new Client(getClientFromRequestBody(req.body));
        client.save(function (err) {
            if (err) {
                return res.send(err);
            }

            res.json({message: 'Client created!', data: client});
        });
    });


module.exports = router;
