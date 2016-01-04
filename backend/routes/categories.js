var express = require('express');
var router = express.Router();

var request = require('request');
var cheerio = require('cheerio');

module.exports = function () {
    router.route('/')
        // Get all categories from VnExpress.
        .get(function (req, res) {
            request('http://vnexpress.net/', function(err, response, html) {
                if (err) {
                    return res.status(500).send(err);
                }

                var $ = cheerio.load(html);
                var results = [];

                $('li', '#menu_web').each(function(i, element) {
                    results.push($(this).text().trim());
                });

                return res.send(results);
            });
        });

    return router;
};
