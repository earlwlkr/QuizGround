var express = require('express');
var app = express();
var mongoose = require('mongoose');
var routes = require('./routes');
var bodyParser = require('body-parser');
var passport = require('passport');
var oauth2 = require('./oauth2');
var User = require('./models/user');
require('./auth');

var http = require('http').Server(app);
var socket = require('./socket')(http);

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
app.post('/oauth2/google', function (req, res) {
    var user = User.createFromRequest(req);
    User.findOne({email: user.email}, function (err, existingUser) {
        if (err) {
            return res.status(400).json(err);
        }
        if (existingUser) {
            oauth2.saveToken(existingUser._id, req.body.client_id, function (err, accessToken, refreshToken, expiresIn) {
                if (err) {
                    return res.status(400).json(err);
                }
                res.json({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires_in: expiresIn.expires_in
                });
            });
        } else {
            user.save(function (err) {
                if (err) {
                    return res.status(400).json(err);
                }
                oauth2.saveToken(user._id, req.body.client_id, function (err, accessToken, refreshToken, expiresIn) {
                    if (err) {
                        return res.status(500).json(err);
                    }
                    res.json({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        expires_in: expiresIn.expires_in
                    });
                });
            });
        }
    });
});

app.use('/api/quizzes', routes.quizzes(socket));
app.use('/api/clients', routes.clients);
app.use('/api/users', routes.users);
app.use('/api/categories', routes.categories);
app.use('/api/comments', routes.comments(socket));

var port = process.env.PORT || 3000;
http.listen(port, function () {
    console.log('App listening on port %s', port);
});