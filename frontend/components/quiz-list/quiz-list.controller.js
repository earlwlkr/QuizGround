(function () {
    'use strict';

    angular.module('app')
        .controller('QuizListController', QuizListController);

    function QuizListController($scope, QuizService, socket) {
        socket.on('init', function (data) {
            console.log(data);
        });
        QuizService.getAllQuizzes().then(function (response) {
            $scope.quizzes = response.data;
        });
    }

}());