var passport        = require('passport'),
    BasicStrategy   = require('passport-http').BasicStrategy,
    BearerStrategy  = require('passport-http-bearer').Strategy,
    User            = require('./models/user'),
    Client          = require('./models/client'),
    AccessToken     = require('./models/access-token');


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new BasicStrategy(
    function (email, password, done) {
        Client.findById(email, function (err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.secret !== password) { return done(null, false); }
            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function (accessToken, done) {
        AccessToken.findOne({ accessToken: accessToken }, function (err, token) {
            if (err) { return done(err); }
            if (!token) { return done(null, false); }
            if (token.expirationDate < new Date()) {
                token.remove().then(function () {
                    return done(null, false);
                });
            } else {
                User.find({ _id: token.userId }, function (err, user) {
                    if (err) { return done(err); }
                    if (!user) { return done(null, false); }
                    var info = { scope: '*' };
                    done(null, user, info);
                });
            }
        });
    }
));
