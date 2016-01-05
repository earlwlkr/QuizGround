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
                var results = ['Tất cả'];

                $('li', '#menu_web').each(function(i, element) {
                    results.push($(this).text().trim());
                });

                results.splice(1, 1);
                results.splice(-5, 5);
                return res.send(results);
            });
        });

    return router;
};
