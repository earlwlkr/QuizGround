'use strict';

var quizGroundServices = angular.module('app');

quizGroundServices.factory('QuizService', ['$http', 'AuthenticationService',
    function ($http, AuthenticationService) {
        var baseUrl = 'http://afternoon-forest-3536.herokuapp.com/api/quizzes',
            QuizService = {};

        QuizService.getAllQuizzes = function () {
            return $http.get(baseUrl);
        };

        QuizService.createQuiz = function (quiz) {
            return $http.post(baseUrl, quiz, AuthenticationService.getBearerHeader());
        };

        return QuizService;
    }]);

quizGroundServices.factory('AuthInterceptorService', ['$q', 'AuthenticationService',
    function ($q, AuthenticationService) {

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
