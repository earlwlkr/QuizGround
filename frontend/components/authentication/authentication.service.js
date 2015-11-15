(function () {
    'use strict';

    angular.module('app')
        .factory('AuthenticationService', AuthenticationService);

    function AuthenticationService($http, $cookies) {
        var loginUrl = 'http://afternoon-forest-3536.herokuapp.com/oauth2/token',
            signupUrl = 'http://afternoon-forest-3536.herokuapp.com/api/users',
            AuthenticationService = {};

        AuthenticationService.token = $cookies.get('access_token');

        AuthenticationService.getBearerHeader = function () {
            if (AuthenticationService.token) {
                return {
                    headers: {
                        'Authorization': 'Bearer ' + AuthenticationService.token
                    }
                };
            }
            return null;
        };

        AuthenticationService.login = function (user) {
            return $http.post(loginUrl, {
                username:   user.username,
                password:   user.password,
                grant_type: 'password',
                client_id:  AuthenticationService.clientId
            });
        };

        AuthenticationService.signup = function (user) {
            return $http.post(signupUrl, {
                username:   user.username,
                password:   user.password,
                name:       user.name
            });
        };

        AuthenticationService.handleResponse = function (data) {
            AuthenticationService.token = data.access_token;
            AuthenticationService.expirationDate = new Date(Date.now() + data.expires_in * 1000);
            AuthenticationService.refreshToken = data.refresh_token;
            $cookies.put('access_token', AuthenticationService.token, { expires: AuthenticationService.expirationDate });
        };

        AuthenticationService.refreshAccessToken = function () {
            return $http.post(loginUrl, {
                refresh_token:  AuthenticationService.refreshToken,
                grant_type:     'refresh_token',
                client_id:      AuthenticationService.clientId
            }).then(function (response) {
                AuthenticationService.handleResponse(response.data);
            });
        };

        return AuthenticationService;
    }

}());