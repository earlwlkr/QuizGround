'use strict';

var quizGroundControllers = angular.module('quizGroundControllers', [
    'ngMaterial', 'ngMessages', 'quizGroundServices'
]);

quizGroundControllers.controller('QuizListController', ['$scope', 'QuizService',
    function ($scope, QuizService) {
        QuizService.getAllQuizzes().then(function (response) {
           $scope.quizzes = response.data;
        });
    }]);

quizGroundControllers.controller('QuizEditController', ['$scope', 'QuizService',
    function ($scope, QuizService) {
        $scope.save = function (quiz) {
          QuizService.createQuiz(quiz).then(function (response) {

          });
        };
    }]);
