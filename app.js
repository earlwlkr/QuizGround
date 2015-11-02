var express = require('express');
var app = express();
var mongoose = require('mongoose');
var routes = require('./routes');
var bodyParser = require('body-parser');
var passport = require('passport');
var oauthServer = require('./oauth2');
require('./auth');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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



app.post('/oauth2/token', oauthServer.token);

app.use('/api/quizzes', passport.authenticate('bearer', { session: false }), routes.quizzes);
app.use('/api/clients', routes.clients);
app.use('/api/users', routes.users);

var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;

    console.log('App listening on port %s', port);
});