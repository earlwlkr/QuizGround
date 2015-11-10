(function () {
    'use strict';

    angular.module('app')
        .controller('QuizListController', QuizListController);

    function QuizListController($scope, QuizService) {
        QuizService.getAllQuizzes().then(function (response) {
            $scope.quizzes = response.data;
        });
    }

}());