(function () {
    'use strict';

    angular.module('app')
        .controller('QuizDetailController', QuizDetailController);

    function QuizDetailController($routeParams, $scope, $mdToast, SweetAlert, $rootScope,
                                  QuizService, CommentService, AuthenticationService, socket) {

        function updateCurrentUserInfo() {
            $scope.user = AuthenticationService.currentUser;
            $scope.isLoggedIn = true;
        }

        AuthenticationService.registerObserverCallback(updateCurrentUserInfo);

        $scope.user = AuthenticationService.currentUser;

        socket.on('quizzes:update', function (quiz) {
            if ($scope.quiz._id == quiz._id) {
                $scope.quiz = quiz;
            }
        });

        QuizService.getQuizDetail($routeParams.quizId).then(function (response) {
            $scope.quiz = response.data;
        });

        $scope.submitAnswer = function (quiz) {
            if (!AuthenticationService.currentUser) {
                showLoginNotificationToast();
                return;
            }
            QuizService.submitQuiz(quiz).then(function (res) {
                if (res.data.error) {
                    alert(res.data.message);
                } else if (res.data === false) {
                    alert('Wrong answer!');
                } else {
                    alert('Right answer!');
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
            if (!AuthenticationService.currentUser) {
                showLoginNotificationToast();
                return;
            }
            CommentService.submitComment($scope.quiz._id, $scope.commentContent).then(function (res) {
                $scope.commentContent = '';
                showToast(res.data.message);
            }, function (res) {
                alert(res.data);
            });
        };

        $scope.deleteComment = function (commentId) {
            if (!AuthenticationService.currentUser) {
                showLoginNotificationToast();
                return;
            }
            CommentService.deleteComment($scope.quiz._id, commentId).then(function (res) {
                showToast('Comment deleted!');
            }, function (res) {
                alert(res.data);
            });
        };

        $scope.deleteQuiz = function (quiz) {
            if (!AuthenticationService.currentUser) {
                showLoginNotificationToast();
                return;
            }
            QuizService.deleteQuiz(quiz).then(function (response) {
                showToast('Deleted successfully');
            }, function (res) {
                alert(res.data);
            });
        };

        function showLoginNotificationToast() {
            $rootScope.showLoginSignUpDialog();
            showToast('Please log in before doing this!');
        }

        function showToast(msg) {
            var toast = $mdToast.simple()
                .textContent(msg)
                .position('top right')
                .action('OK');
            $mdToast.show(toast);
        }
        
        function alert(msg) {
            SweetAlert.swal(msg);
        }
    }
}());