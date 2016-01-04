'use strict';

/* App Module */

var quizGroundApp = angular.module('app', [
    'ngRoute',
    'ngMaterial',
    'ngMessages',
    'ngCookies',
    'ngFileUpload',
    'ngAnimate',
    'md.chips.select'
]);

quizGroundApp.constant('ServerInfo', {
   baseUrl: 'http://localhost:3000'//'http://afternoon-forest-3536.herokuapp.com'
}).constant('Environment', {
    dev: {
        clientId: '568667b903324e6033783c9a',
        header: 'Basic NTY4NjY3YjkwMzMyNGU2MDMzNzgzYzlhOnNlY3VyZQ=='
    },
    production: {
        clientId: '5648048f62bd961100878525',
        header: 'Basic NTY0ODA0OGY2MmJkOTYxMTAwODc4NTI1OnZlcnkgc2VjdXJl=='
    }
});

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
            .when('/profile', {
                templateUrl: 'components/profile/profile.html',
                controller: 'ProfileController'
            })
            .otherwise({
                redirectTo: '/'
            });
        //$httpProvider.interceptors.push('AuthInterceptorService');
        //$locationProvider.html5Mode(true);
    }]);

quizGroundApp.run(function ($http, $rootScope, AuthenticationService, $templateCache, Environment) {
    AuthenticationService.clientId = Environment.production.clientId;
    $http.defaults.headers.common.Authorization = Environment.production.header;
    $templateCache.removeAll();
});