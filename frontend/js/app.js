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

//quizGroundApp.run(function ($http, AuthService) {
//    //AuthService.clientId = '5636b83a3bb1ced81c3db237';
//    //$http.defaults.headers.common.Authorization = 'Basic NTYzNmI4M2EzYmIxY2VkODFjM2RiMjM3OnZlcnkgc2VjdXJl==';
//});
