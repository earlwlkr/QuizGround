var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    User = require('./models/user'),
    Client = require('./models/client'),
    AuthorizationCode = require('./models/authorization-code'),
    AccessToken = require('./models/access-token'),
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

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes.  The callback takes the `client` requesting
// authorization, the `redirectUri` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a code, which is bound to these
// values, and will be exchanged for an access token.

server.grant(oauth2orize.grant.code(function (client, redirectUri, user, ares, done) {
    User.findById(client.userId, function (err, user) {
        if (err) {
            return done(err);
        }
        var code = utils.uid(16),
            authorizationCode = new AuthorizationCode({
                clientId:           client._id.toString(),
                userId:             user._id.toString(),
                authorizationCode:  code,
                redirectUri:        redirectUri
            });

        authorizationCode.save(function (err) {
            if (err) {
                return done(err);
            }
            done(null, code);
        });
    });
}));

// Exchange authorization codes for access tokens.  The callback accepts the
// `client`, which is exchanging `code` and any `redirectUri` from the
// authorization request for verification.  If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.

server.exchange(oauth2orize.exchange.code(function (client, code, redirectUri, done) {
    AuthorizationCode.findOne({ authorizationCode: code }, function (err, authCode) {
        if (err) {
            return done(err);
        }
        if (!authCode) {
            return done(null, false);
        }
        if (redirectUri !== authCode.redirectUri) {
            return done(null, false);
        }
        if (client._id.toString() !== authCode.clientId) {
            return done(null, false);
        }
        AuthorizationCode.findOneAndRemove({ authorizationCode: code }, function (err) {
            if (err) {
                return done(err);
            }
            var token = utils.uid(64),
                accessToken = new AccessToken({
                    userId:         authCode.userId,
                    clientId:       authCode.clientId,
                    accessToken:    token
                });
            accessToken.save(function (err) {
                if (err) {
                    return done(err);
                }
                done(null, token);
            });
        });
    });
}));


// user authorization endpoint
//
// `authorization` middleware accepts a `validate` callback which is
// responsible for validating the client making the authorization request.  In
// doing so, is recommended that the `redirectUri` be checked against a
// registered value, although security requirements may vary accross
// implementations.  Once validated, the `done` callback must be invoked with
// a `client` instance, as well as the `redirectUri` to which the user will be
// redirected after an authorization decision is obtained.
//
// This middleware simply initializes a new authorization transaction.  It is
// the application's responsibility to authenticate the user and render a dialog
// to obtain their approval (displaying details about the client requesting
// authorization).  We accomplish that here by routing through `ensureLoggedIn()`
// first, and rendering the `dialog` view.

exports.authorization = [
    server.authorization(function (clientId, redirectUri, done) {
        Client.findById(clientId, function (err, client) {
            if (err) {
                return done(err);
            }
            // WARNING: For security purposes, it is highly advisable to check that
            //          redirectUri provided by the client matches one registered with
            //          the server.  For simplicity, this example does not.  You have
            //          been warned.
            return done(null, client, redirectUri);
        });
    }),
    function (req, res) {
        res.json({ transactionId: req.oauth2.transactionID, client: req.oauth2.client });
    }
];

// user decision endpoint
//
// `decision` middleware processes a user's decision to allow or deny access
// requested by a client application.  Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.

exports.decision = [
    server.decision()
];


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