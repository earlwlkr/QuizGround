(function () {
    'use strict';

    angular.module('app')
        .controller('QuizListController', QuizListController);

    function QuizListController($scope, QuizService, socket) {
        socket.on('quizzes:new', function (data) {
            $scope.quizzes.splice(0, 0, data);
        });
        QuizService.getAllQuizzes().then(function (response) {
            $scope.quizzes = response.data;
        });

        $scope.updateQuizSubmitButtonStatus = function (quiz) {
            $scope.showSubmitButton = false;
            angular.forEach(quiz.choices, function (value) {
               if (value.userChoice) {
                   $scope.showSubmitButton = true;
               }
            });
        };

        $scope.submitAnswer = function (quiz) {

        };
    }
}());