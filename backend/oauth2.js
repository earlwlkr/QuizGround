var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    User = require('./models/user'),
    Client = require('./models/client'),
    AccessToken = require('./models/access-token'),
    RefreshToken = require('./models/refresh-token'),
    utils = require('./utils');

// create OAuth 2.0 server
var server = oauth2orize.createServer();
var expiresIn = 3600;

server.serializeClient(function (client, done) {
    return done(null, client._id);
});

server.deserializeClient(function (id, done) {
    Client.findById(id, function (err, client) {
        if (err) {
            return done(err);
        }
        return done(null, client);
    });
});

function generateAccessToken(userId, clientId) {
    return new AccessToken({
        userId: userId,
        clientId: clientId,
        accessToken: utils.uid(64),
        expirationDate: new Date(Date.now() + expiresIn * 1000)
    });
}

function saveToken(userId, clientId, done) {
    var accessToken = generateAccessToken(userId, clientId);
    accessToken.save(function (err) {
        if (err) {
            return done(err);
        }
        var refreshToken = new RefreshToken({
            userId: userId,
            clientId: clientId,
            refreshToken: utils.uid(64)
        });
        refreshToken.save(function (err) {
            if (err) {
                return done(err);
            }
            return done(null, accessToken.accessToken, refreshToken.refreshToken, {expires_in: expiresIn});
        });
    });
}

/**
 * Exchange user id and password for access tokens.
 *
 * The callback accepts the `client`, which is exchanging the user's name and password
 * from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the user who authorized the code.
 */
server.exchange(oauth2orize.exchange.password(function (client, email, password, scope, done) {
    // Validate the user
    User.findOne({email: email}, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false);
        }
        if (password !== user.password) {
            return done(null, false);
        }
        if (!client) {
            return done(null, false);
        }
        return saveToken(user._id, client._id, done);
    });
}));

/**
 * Exchange the refresh token for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id from the token
 * request for verification.  If this value is validated, the application issues an access
 * token on behalf of the client who authorized the code
 */
server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scope, done) {
    RefreshToken.findOne({refreshToken: refreshToken}, function (err, token) {
        if (err) {
            return done(err);
        }
        if (!token) {
            return done(null, false);
        }
        if (client._id.toString() !== token.clientId) {
            return done(null, false);
        }

        var accessToken = generateAccessToken(token.userId, token.clientId);
        accessToken.save(function (err) {
            if (err) {
                return done(err);
            }
            return done(null, accessToken.accessToken, null, {expires_in: 3600});
        });
    });
}));

// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

module.exports = {
    token: [
        passport.authenticate('basic', {session: false}),
        server.token(),
        server.errorHandler()
    ],
    saveToken: saveToken,
    isAuthenticated: passport.authenticate('bearer', {session: false})
};
