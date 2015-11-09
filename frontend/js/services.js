'use strict';

var quizGroundServices = angular.module('quizGroundServices', [
    'ngCookies'
]);

quizGroundServices.factory('QuizService', ['$http', 'AuthService',
    function ($http, AuthService) {
        var baseUrl = 'http://localhost:3000/api/quizzes',
            QuizService = {};

        QuizService.getAllQuizzes = function () {
            return $http.get(baseUrl);
        };

        QuizService.createQuiz = function (quiz) {
            return $http.post(baseUrl, quiz, AuthService.getBearerHeader());
        };

        return QuizService;
    }]);

quizGroundServices.factory('AuthService', ['$http', '$cookies',
    function ($http, $cookies) {
        var logInUrl = 'http://localhost:3000/oauth2/token',
            signUpUrl = 'http://localhost:3000/api/users',
            AuthService = {};

        AuthService.token = $cookies.get('access_token');

        AuthService.getBearerHeader = function () {
            if (AuthService.token) {
                return {
                    headers: {
                        'Authorization': 'Bearer ' + AuthService.token
                    }
                };
            }
            return null;
        }

        AuthService.logIn = function (user) {
            return $http.post(logInUrl, {
                username:   user.username,
                password:   user.password,
                grant_type: 'password',
                client_id:  AuthService.clientId
            });
        };

        AuthService.signUp = function (user) {
            return $http.post(signUpUrl, {
                username:   user.username,
                password:   user.password,
                name:       user.name
            });
        };

        AuthService.handleResponse = function (data) {
            AuthService.token = data.access_token;
            AuthService.expirationDate = new Date(Date.now() + data.expires_in * 1000);
            AuthService.refreshToken = data.refresh_token;
            $cookies.put('access_token', AuthService.token, { expires: AuthService.expirationDate });
        };

        AuthService.refreshAccessToken = function () {
            return $http.post(logInUrl, {
                refresh_token:  AuthService.refreshToken,
                grant_type:     'refresh_token',
                client_id:      AuthService.clientId
            }).then(function (response) {
                AuthService.handleResponse(response.data);
            });
        };

        return AuthService;
    }]);

quizGroundServices.factory('AuthInterceptorService', ['$q', 'AuthService',
    function ($q, AuthService) {

        var AuthInterceptorService = {};

        AuthInterceptorService.request = function (config) {
            config.headers = config.headers || {};

            if (AuthService.token) {
                config.headers.Authorization = 'Bearer ' + AuthService.token;
            }

            return config;
        };

        AuthInterceptorService.responseError = function (rejection) {
            if (rejection.status === 401 && AuthService.refreshToken) {
                AuthService.refreshAccessToken();
            }
            return $q.reject(rejection);
        };

        return AuthInterceptorService;
    }]);
