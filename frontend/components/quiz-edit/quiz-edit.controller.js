(function () {
    'use strict';

    angular.module('app')
        .controller('QuizEditController', QuizEditController);

    function QuizEditController($scope, QuizService) {
        $scope.save = function (quiz) {
            QuizService.createQuiz(quiz).then(function (response) {

            });
        };
    }

}());