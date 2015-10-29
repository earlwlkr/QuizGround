var express = require('express');
var app = express();
var mongoose = require('mongoose');
var routes = require('./routes');
var bodyParser = require('body-parser');
var passport = require('passport');
var oauthServer = require('./oauth2');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('express-session')({
    secret: 'quizground secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

mongoose.connect('mongodb://localhost/quizground');

require('./auth');

app.get('/oauth2/authorize', oauthServer.authorization);
app.post('/oauth2/authorize/decision', oauthServer.decision);
app.post('/oauth2/token', oauthServer.token);

app.use('/api/quizzes', passport.authenticate('bearer', { session: false }), routes.quizzes);
app.use('/api/clients', routes.clients);

var server = app.listen(3000, function () {
    var host = server.address().address,
        port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});