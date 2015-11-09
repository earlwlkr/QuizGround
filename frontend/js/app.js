'use strict';

/* App Module */

var quizGroundApp = angular.module('quizGroundApp', [
    'ngRoute',
    'quizGroundControllers'
]);

quizGroundApp.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/quiz-list.html',
                controller: 'QuizListController'
            })
            .when('/quiz/edit', {
                templateUrl: 'partials/quiz-edit.html',
                controller: 'QuizEditController'
            })
            .otherwise({
                redirectTo: '/'
            });
        //$httpProvider.interceptors.push('AuthInterceptorService');
        //$locationProvider.html5Mode(true);
    }]);

quizGroundApp.run(function ($http, AuthService) {
    AuthService.clientId = '5640ad8141b3965c08d35c9a';
    $http.defaults.headers.common.Authorization = 'Basic NTY0MGFkODE0MWIzOTY1YzA4ZDM1YzlhOnZlcnkgc2VjdXJl==';
});
