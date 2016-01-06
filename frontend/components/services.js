'use strict';

var quizGroundServices = angular.module('app');

quizGroundServices.factory('QuizService', function ($http, AuthenticationService, ServerInfo) {
    var baseUrl = ServerInfo.baseUrl + '/api/quizzes',
        submitUrl = ServerInfo.baseUrl + '/api/quizzes/',
        categoriesUrl = ServerInfo.baseUrl + '/api/categories/',
        QuizService = {};

    QuizService.getAllQuizzes = function (category, userId) {
        var url = baseUrl;
        if (category) {
            url += '?categories=' + category;
        } else if (userId) {
            url += '?userId=' + userId;
        }
        return $http.get(url);
    };

    QuizService.getAllCategories = function () {
        return $http.get(categoriesUrl);
    };

    QuizService.createQuiz = function (quiz) {
        if (AuthenticationService.currentUser) {
            quiz.creator = {
                id: AuthenticationService.currentUser._id
            };
        }

        quiz.categories = quiz.categories.map(function (item) {
            return item.title;
        });

        return $http.post(baseUrl, quiz, AuthenticationService.getBearerHeader());
    };

    QuizService.deleteQuiz = function (quiz) {
        var url = baseUrl + '/';
        if (AuthenticationService.currentUser.isAdmin
            || quiz.creator._id == AuthenticationService.currentUser._id) {
            url += quiz._id + '/' + AuthenticationService.currentUser._id;
        }

        return $http.delete(url, AuthenticationService.getBearerHeader());
    };

    QuizService.submitQuiz = function (quiz) {
        quiz.userId = AuthenticationService.currentUser._id;
        return $http.post(submitUrl + quiz._id, quiz, AuthenticationService.getBearerHeader());
    };

    QuizService.getQuizDetail = function (quizId) {
        return $http.get(submitUrl + quizId);
    };

    QuizService.votes = function (quiz) {
        // console.log(quiz);
        return $http.put(submitUrl + quiz._id, quiz, AuthenticationService.getBearerHeader());
    };

    return QuizService;
});

quizGroundServices.factory('CommentService', function ($http, AuthenticationService, ServerInfo) {
    var commentsUrl = ServerInfo.baseUrl + '/api/comments/',
        CommentService = {};

    CommentService.submitComment = function (quizId, content) {
        var comment = {
            content: content,
            creator: {
                _id: AuthenticationService.currentUser._id
            }
        };
        return $http.post(commentsUrl + quizId, comment, AuthenticationService.getBearerHeader());
    };

    return CommentService;
});

quizGroundServices.factory('socket', function ($rootScope, ServerInfo) {
    var socket = io.connect(ServerInfo.baseUrl);
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});

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
