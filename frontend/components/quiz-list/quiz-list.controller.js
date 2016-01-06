(function () {
    'use strict';

    angular.module('app')
        .controller('QuizListController', QuizListController);

    function QuizListController($rootScope, $scope, $mdToast, QuizService, AuthenticationService, socket) {

        socket.on('quizzes:new', function (quiz) {
            $scope.quizzes.splice(0, 0, quiz);
        });

        socket.on('quizzes:delete', function (id) {
            $scope.quizzes = $scope.quizzes.filter(function (item) {
                return item._id !== id;
            });
        });

        socket.on('quizzes:update', function (quiz) {
            angular.forEach($scope.quizzes, function (item, key) {
                if (item._id === quiz._id) {
                    $scope.quizzes[key] = quiz;
                }
            });
        });

        QuizService.getAllQuizzes().then(function (response) {
            $scope.quizzes = response.data.map(function (item) {
                item.url = 'http://quiz-ground.herokuapp.com/#/quiz-detail/' + item._id;
                item.tweet = 'Try this quiz on QuizGround!';
                return item;
            });
        });

        QuizService.getAllCategories().then(function (response) {
            $scope.categories = response.data;
        });

        // Rating
        $scope.rateQuiz = function (quiz, rating) {
            QuizService.rateQuiz(quiz._id, rating).then(function (res) {
                showToast(res.data.message);
                if (res.data.rating) {
                    quiz.rating = res.data.rating;
                }
            });
        };

        $scope.selectCategory = function (category) {
            $scope.quizzes = [];
            $scope.loading = true;

            QuizService.getAllQuizzes(category).then(function (response) {
                $scope.quizzes = response.data;
                $scope.loading = false;
            });
        };

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

        $scope.deleteQuiz = function (quiz) {
            QuizService.deleteQuiz(quiz).then(function (response) {
                showToast('Deleted successfully');
            });
        };

        function showToast(msg) {
            var toast = $mdToast.simple()
                .textContent(msg)
                .position('top right')
                .action('OK');
            $mdToast.show(toast);
        }

        $scope.share = function() {
            /*FB.ui({
                method: 'share',
                href: 'https://developers.facebook.com/docs/',
            }, function(response){
                console.log(response.error_message);
            });*/
        };

        function showLoginNotificationToast() {
            $rootScope.showLoginSignUpDialog();
            showToast('Please log in before vote quiz!');
        }
    }
}());