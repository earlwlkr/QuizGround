(function () {
    'use strict';

    angular.module('app')
        .controller('QuizListController', QuizListController);

    function QuizListController($scope, QuizService, socket) {
        socket.on('quizzes:new', function (data) {
            console.log(data);
            $scope.quizzes.splice(0, 0, data);
        });
        QuizService.getAllQuizzes().then(function (response) {
            $scope.quizzes = response.data;
        });
    }

}());