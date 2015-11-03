'use strict';

var quizGroundServices = angular.module('quizGroundServices', [
    'ngCookies'
]);

quizGroundServices.factory('AuthService', ['$http', '$cookies',
    function ($http, $cookies) {
        var loginUrl = 'http://localhost:3000/oauth2/token',
            signupUrl = 'http://localhost:3000/api/users',
            AccountService = {};
        AccountService.token = $cookies.get('access_token');
        AccountService.login = function (user) {
            return $http.post(loginUrl, {
                username:   user.username,
                password:   user.password,
                grant_type: 'password',
                client_id:  AccountService.clientId
            });
        };
        AccountService.signup = function (user) {
            return $http.post(signupUrl, {
                username:   user.username,
                password:   user.password,
                name:       user.name
            });
        };
        AccountService.handleResponse = function (data) {
            AccountService.token = data.access_token;
            AccountService.expirationDate = new Date(Date.now() + data.expires_in * 1000);
            AccountService.refreshToken = data.refresh_token;
            $cookies.put('access_token', AccountService.token, { expires: AccountService.expirationDate });

        };
        AccountService.refreshAccessToken = function () {
            return $http.post(loginUrl, {
                refresh_token:  AccountService.refreshToken,
                grant_type:     'refresh_token',
                client_id:      AccountService.clientId
            }).then(function (response) {
                AccountService.handleResponse(response.data);
            });
        };

        return AccountService;
    }]);

quizGroundServices.factory('AuthInterceptorService', ['$q', 'AccountService',
    function ($q, AccountService) {

        var AuthInterceptorService = {};

        AuthInterceptorService.request = function (config) {

            config.headers = config.headers || {};

            if (AccountService.token) {
                config.headers.Authorization = 'Bearer ' + AccountService.token;
            }

            return config;
        };

        AuthInterceptorService.responseError = function (rejection) {
            if (rejection.status === 401 && AccountService.refreshToken) {
                AccountService.refreshAccessToken();
            }
            return $q.reject(rejection);
        };

        return AuthInterceptorService;
    }]);
