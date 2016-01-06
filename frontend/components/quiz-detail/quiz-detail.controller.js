(function () {
    'use strict';

    angular.module('app')
        .controller('QuizDetailController', QuizDetailController);

    function QuizDetailController($routeParams, $scope, $mdToast,
                                  QuizService, CommentService, AuthenticationService, socket) {

        socket.on('comments:new', function (comment) {
            if (comment.quizId === $scope.quiz._id) {
                $scope.quiz.comments.splice(0, 0, comment);
            }
        });

        socket.on('comments:delete', function (id) {

        });

        QuizService.getQuizDetail($routeParams.quizId).then(function (response) {
            $scope.quiz = response.data;
        });

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

        $scope.updateQuizSubmitButtonStatus = function (quiz) {
            quiz.showSubmitButton = false;
            angular.forEach(quiz.choices, function (value) {
                if (value.userChoice) {
                    quiz.showSubmitButton = true;
                }
            });
        };

        $scope.submitComment = function () {
            CommentService.submitComment($scope.quiz._id, $scope.commentContent).then(function (res) {
                $scope.commentContent = '';
                showToast(res.data.message);
            });
        };

        $scope.deleteComment = function (commentId) {
            CommentService.deleteComment(commentId).then(function (res) {
                showToast('Comment deleted!');
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
    }
}());