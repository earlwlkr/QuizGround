(function () {
    'use strict';

    angular.module('app')
        .factory('ProfileService', ProfileService);

    function ProfileService($http, $cookies, ServerInfo) {
        var loginUrl = ServerInfo.baseUrl + '/oauth2/token',
            signupUrl = ServerInfo.baseUrl + '/api/users',
            googleLoginUrl = ServerInfo.baseUrl + '/oauth2/google',
            userInfoUrl = ServerInfo.baseUrl + '/api/users/',
            ProfileService = {};

        var observerCallbacks = [];

        ProfileService.registerObserverCallback = function (callback) {
            observerCallbacks.push(callback);
        };

        ProfileService.getBearerHeader = function () {
            if (ProfileService.token) {
                return {
                    headers: {
                        'Authorization': 'Bearer ' + ProfileService.token
                    }
                };
            }
            return null;
        };

        ProfileService.login = function (user) {
            return $http.post(loginUrl, {
                username: user.email,
                password: user.password,
                grant_type: 'password',
                client_id: ProfileService.clientId
            });
        };

        ProfileService.signup = function (user) {
            return $http.post(signupUrl, {
                email: user.email,
                password: user.password,
                firstName: user.firstName,
                lastName: user.lastName
            });
        };

        ProfileService.googleLogin = function (email, firstName, lastName) {
            return $http.post(googleLoginUrl, {
                email: email,
                firstName: firstName,
                lastName: lastName,
                client_id: ProfileService.clientId
            });
        };

        ProfileService.handleResponse = function (data) {
            ProfileService.token = data.access_token;
            ProfileService.expirationDate = new Date(Date.now() + data.expires_in * 1000);
            ProfileService.refreshToken = data.refresh_token;
            $cookies.put('access_token', ProfileService.token, {expires: ProfileService.expirationDate});
            ProfileService.isLoggedIn = true;

            getUserInfo();
        };

        ProfileService.refreshAccessToken = function () {
            return $http.post(loginUrl, {
                refresh_token: ProfileService.refreshToken,
                grant_type: 'refresh_token',
                client_id: ProfileService.clientId
            }).then(function (response) {
                ProfileService.handleResponse(response.data);
            });
        };

        // Helpers
        function getUserInfo() {
            if (!ProfileService.token) return;

            $http.get(userInfoUrl + ProfileService.token, ProfileService.getBearerHeader())
                .then(function (response) {
                    ProfileService.currentUser = response.data;
                    notifyObservers();
                }, function () {
                });
        }

        function notifyObservers() {
            angular.forEach(observerCallbacks, function (callback) {
                callback();
            });
        }

        ProfileService.token = $cookies.get('access_token');
        getUserInfo();

        return ProfileService;
    }

}());