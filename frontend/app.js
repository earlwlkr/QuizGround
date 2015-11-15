'use strict';

/* App Module */

var quizGroundApp = angular.module('app', [
    'ngRoute',
    'ngMaterial',
    'ngMessages',
    'ngCookies'
]);

quizGroundApp.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'components/quiz-list/quiz-list.html',
                controller: 'QuizListController'
            })
            .when('/quiz/edit', {
                templateUrl: 'components/quiz-edit/quiz-edit.html',
                controller: 'QuizEditController'
            })
            .otherwise({
                redirectTo: '/'
            });
        //$httpProvider.interceptors.push('AuthInterceptorService');
        //$locationProvider.html5Mode(true);
    }]);

quizGroundApp.run(function ($http, AuthenticationService) {
    AuthenticationService.clientId = '5648048f62bd961100878525';
    $http.defaults.headers.common.Authorization = 'Basic NTY0ODA0OGY2MmJkOTYxMTAwODc4NTI1OnZlcnkgc2VjdXJl==';
});
