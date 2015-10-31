var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    User = require('./models/user'),
    Client = require('./models/client'),
    AccessToken = require('./models/access-token'),
    RefreshToken = require('./models/refresh-token'),
    utils = require('./utils');

// create OAuth 2.0 server
var server = oauth2orize.createServer();

// Register serialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's Id, and deserializing by finding
// the client by Id from the database.

server.serializeClient(function (client, done) {
    return done(null, client._id);
});

server.deserializeClient(function (id, done) {
    Client.findOne({ _id: id }, function (err, client) {
        if (err) {
            return done(err);
        }
        return done(null, client);
    });
});

function generateAccessToken(userId, clientId) {
    return new AccessToken({
        userId:         userId,
        clientId:       clientId,
        accessToken:    utils.uid(64)
    });
}

/**
 * Exchange user id and password for access tokens.
 *
 * The callback accepts the `client`, which is exchanging the user's name and password
 * from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the user who authorized the code.
 */
server.exchange(oauth2orize.exchange.password(function (client, username, password, scope, done) {
    // Validate the user
    User.findOne({ username: username }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false);
        }
        if (password !== user.password) {
            return done(null, false);
        }
        Client.findOne({ userId: user._id}, function (err, client) {
            if (err) {
                return done(err);
            }
            if (!client) {
                return done(null, false);
            }
            var accessToken = generateAccessToken(user._id, client._id);
            accessToken.save(function (err) {
                if (err) {
                    return done(err);
                }
                var refreshTokenValue = null;
                // mimic openid connect's offline scope to determine if we send
                // a refresh token or not
                if (scope && scope.indexOf("offline_access") === 0) {
                    refreshTokenValue = utils.uid(64);
                    var refreshToken = new RefreshToken({
                        userId:         user._id,
                        clientId:       client._id,
                        refreshToken:   refreshTokenValue
                    });
                    refreshToken.save(refreshToken, user.id, client.id, scope, function (err) {
                        if (err) {
                            return done(err);
                        }
                        return done(null, accessToken.accessToken, refreshTokenValue, {expires_in: 3600});
                    });
                } else {
                    return done(null, accessToken.accessToken, refreshTokenValue, {expires_in: 3600});
                }
            });
        });
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
    RefreshToken.findOne({ refreshToken: refreshToken }, function (err, token) {
        if (err) {
            return done(err);
        }
        if (!token) {
            return done(null, false);
        }
        if (client._id !== token.clientId) {
            return done(null, false);
        }
        var accessToken = generateAccessToken(user._id, client._id);
        accessToken.save(function (err) {
            if (err) {
                return done(err);
            }
            return done(null, token, null, {expires_in: 3600});
        });
    });
}));

// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
];