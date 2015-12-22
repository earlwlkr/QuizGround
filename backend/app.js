var express = require('express');
var app = express();
var mongoose = require('mongoose');
var routes = require('./routes');
var bodyParser = require('body-parser');
var passport = require('passport');
var oauth2 = require('./oauth2');
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
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

var mongoUri = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/quizground';
mongoose.connect(mongoUri);


app.post('/oauth2/token', oauth2.token);

// Redirect the user to Google for authentication.  When complete, Google
// will redirect the user back to the application at /auth/google/return
app.get('/auth/google', passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' }));

// Google will redirect the user to this URL after authentication.  Finish
// the process by verifying the assertion. If valid, the user will be
// logged in.  Otherauthentication has failed.
app.get('/auth/google/callback',
  passport.authenticate('google', { successRedirect: '/',
                                    failureRedirect: '/login' }));

app.use('/api/quizzes', routes.quizzes);
app.use('/api/clients', routes.clients);
app.use('/api/users', routes.users);

var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;

    console.log('App listening on port %s', port);
});