(function () {
    'use strict';

    angular.module('app')
        .controller('QuizListController', QuizListController);

    function QuizListController($scope, $mdToast, QuizService, AuthenticationService, socket) {
        socket.on('quizzes:new', function (data) {
            $scope.quizzes.splice(0, 0, data);
        });
        QuizService.getAllQuizzes().then(function (response) {
            $scope.quizzes = response.data;
        });

        $scope.updateQuizSubmitButtonStatus = function (quiz) {
            quiz.showSubmitButton = false;
            angular.forEach(quiz.choices, function (value) {
                if (value.userChoice) {
                    quiz.showSubmitButton = true;
                }
            });
        };

        $scope.submitAnswer = function (quiz) {
            QuizService.submitQuiz(quiz).then(function (res) {
                if (res.data.error) {
                    showToast(res.data.message);
                } else if (res.data === false) {
                    showToast('Wrong answer!');
                } else {
                    showToast('Right answer!');
                    AuthenticationService.getUserInfo();
                }
            });
        };

        function showToast(msg) {
            var toast = $mdToast.simple()
                .textContent(msg)
                .position('top right')
                .action('OK');
            $mdToast.show(toast);
        }

        // Get categories
        $scope.search = {
            categories: []
        };
        $scope.categories = null;
        QuizService.getAllCategories().then(function (response) {
            $scope.categories = response.data;
        });

        $scope.selectCategory = function (category) {
            var index = $scope.search.categories.indexOf(category);
            if (index > -1) {
                $scope.search.categories.splice(index, 1);
            } else
                $scope.search.categories.push(category);
            //console.log($scope.search.categories);
        };

        $scope.search = function () {
            QuizService.getAllQuizzes(JSON.stringify($scope.search.categories)).then(function (response) {
                $scope.quizzes = response.data;
            });
        };
    }
}());