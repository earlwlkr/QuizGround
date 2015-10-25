var express = require('express');
var app = express();
var routes = require('./routes');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/api', routes.quizzes);

var server = app.listen(3000, function () {
    var host = server.address().address,
        port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});