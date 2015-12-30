'use strict';

var quizGroundServices = angular.module('app');

quizGroundServices.factory('QuizService', ['$http', 'AuthenticationService', 'ServerInfo',
    function ($http, AuthenticationService, ServerInfo) {
        var baseUrl = ServerInfo.baseUrl + '/api/quizzes',
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

            if (AuthenticationService.token) {
                config.headers.Authorization = 'Bearer ' + AuthenticationService.token;
            }

            return config;
        };

        AuthInterceptorService.responseError = function (rejection) {
            if (rejection.status === 401 && AuthenticationService.refreshToken) {
                AuthenticationService.refreshAccessToken();
            }
            return $q.reject(rejection);
        };

        return AuthInterceptorService;
    }]);
