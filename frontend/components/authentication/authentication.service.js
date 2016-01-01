(function () {
    'use strict';

    angular.module('app')
        .factory('AuthenticationService', AuthenticationService);

    function AuthenticationService($http, $cookies, ServerInfo) {
        var loginUrl = ServerInfo.baseUrl + '/oauth2/token',
            signupUrl = ServerInfo.baseUrl + '/api/users',
            googleLoginUrl = ServerInfo.baseUrl + '/oauth2/google',
            userInfoUrl = ServerInfo.baseUrl + '/api/users/',
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
                username:   user.email,
                password:   user.password,
                grant_type: 'password',
                client_id:  AuthenticationService.clientId
            });
        };

        AuthenticationService.signup = function (user) {
            return $http.post(signupUrl, {
                email:      user.email,
                password:   user.password,
                firstName:  user.firstName,
                lastName:   user.lastName
            });
        };

        AuthenticationService.googleLogin = function (email, firstName, lastName) {
            return $http.post(googleLoginUrl, {
                email:      email,
                firstName:  firstName,
                lastName:   lastName,
                client_id:  AuthenticationService.clientId
            });
        };

        AuthenticationService.handleResponse = function (data) {
            AuthenticationService.token = data.access_token;
            AuthenticationService.expirationDate = new Date(Date.now() + data.expires_in * 1000);
            AuthenticationService.refreshToken = data.refresh_token;
            $cookies.put('access_token', AuthenticationService.token, { expires: AuthenticationService.expirationDate });
            AuthenticationService.isLoggedIn = true;

            $http.get(userInfoUrl + data.access_token, AuthenticationService.getBearerHeader())
                .then(function (response) {
                    AuthenticationService.currentUser = response;
                }, function () {
                });
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