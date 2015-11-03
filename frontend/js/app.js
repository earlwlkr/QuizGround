'use strict';

/* App Module */

var quizGroundApp = angular.module('quizGroundApp', [
    'ngRoute',
    'quizGroundControllers'
]);

quizGroundApp.config(['$routeProvider', '$httpProvider',
    function ($routeProvider, $httpProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/quiz-list.html',
                controller: 'QuizListController'
            })
            .otherwise({
                redirectTo: '/'
            });
        //$httpProvider.interceptors.push('AuthInterceptorService');
    }]);

//quizGroundApp.run(function ($http, AuthService) {
//    //AuthService.clientId = '5636b83a3bb1ced81c3db237';
//    //$http.defaults.headers.common.Authorization = 'Basic NTYzNmI4M2EzYmIxY2VkODFjM2RiMjM3OnZlcnkgc2VjdXJl==';
//});
