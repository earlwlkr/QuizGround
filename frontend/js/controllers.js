'use strict';

var quizGroundControllers = angular.module('quizGroundControllers', [
    'ngMaterial', 'ngMessages'
]);

quizGroundControllers.controller('QuizListController', ['$scope',
    function ($scope) {
        $scope.message = 'Hello World!';
    }]);
