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

        var observerCallbacks = [];

        AuthenticationService.registerObserverCallback = function (callback) {
            observerCallbacks.push(callback);
        };

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
                username: user.email,
                password: user.password,
                grant_type: 'password',
                client_id: AuthenticationService.clientId
            });
        };

        AuthenticationService.signup = function (user) {
            return $http.post(signupUrl, {
                email: user.email,
                password: user.password,
                firstName: user.firstName,
                lastName: user.lastName
            });
        };

        AuthenticationService.googleLogin = function (email, firstName, lastName) {
            return $http.post(googleLoginUrl, {
                email: email,
                firstName: firstName,
                lastName: lastName,
                client_id: AuthenticationService.clientId
            });
        };

        AuthenticationService.handleResponse = function (data) {
            AuthenticationService.token = data.access_token;
            AuthenticationService.expirationDate = new Date(Date.now() + data.expires_in * 1000);
            AuthenticationService.refreshToken = data.refresh_token;
            $cookies.put('access_token', AuthenticationService.token, {expires: AuthenticationService.expirationDate});
            AuthenticationService.isLoggedIn = true;

            getUserInfo();
        };

        AuthenticationService.refreshAccessToken = function () {
            return $http.post(loginUrl, {
                refresh_token: AuthenticationService.refreshToken,
                grant_type: 'refresh_token',
                client_id: AuthenticationService.clientId
            }).then(function (response) {
                AuthenticationService.handleResponse(response.data);
            });
        };

        AuthenticationService.getUserInfo = function () {
            getUserInfo();
        };

        // Helpers
        function getUserInfo() {
            if (!AuthenticationService.token) return;

            $http.get(userInfoUrl + AuthenticationService.token, AuthenticationService.getBearerHeader())
                .then(function (response) {
                    AuthenticationService.currentUser = response.data;
                    notifyObservers();
                }, function () {
                });
        }

        function notifyObservers() {
            angular.forEach(observerCallbacks, function (callback) {
                callback();
            });
        }

        AuthenticationService.token = $cookies.get('access_token');
        getUserInfo();

        return AuthenticationService;
    }

}());