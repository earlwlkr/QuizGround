(function () {
    'use strict';

    angular.module('app')
        .controller('QuizEditController', QuizEditController);

    function QuizEditController($scope, $mdToast, $rootScope, QuizService, AuthenticationService, Upload) {
        $scope.quiz = {
            choices: []
        };

        $scope.save = function (quiz) {
            if (!AuthenticationService.currentUser) {
                showLoginNotificationToast();
                return;
            }
            if (!validateQuiz(quiz)) {
                return;
            }
            if ($scope.quizImage) {
                $scope.quizImageUploadProgress = 0;
                uploadImage($scope.quizImage).then(function (res) {
                    quiz.imageSource = res.data.data.link;
                    createQuiz(quiz);
                }, function (res) {
                    console.log('Error status: ' + res.status);
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.quizImageUploadProgress = progressPercentage;
                    console.log('progress: ' + progressPercentage + '% ');
                });
            } else {
                createQuiz(quiz);
            }
        };

        $scope.addChoice = function () {
            $scope.quiz.choices.push({content: 'Choice ' + ($scope.quiz.choices.length + 1), correct: false});
        };

        // Helpers
        function validateQuiz(quiz) {
            if (!quiz.question) {
                showToast('Please specify the quiz question!');
                return null;
            }
            if (quiz.isMultiChoice) {
                quiz.answer = '';
                if (quiz.choices.length < 2) {
                    showToast('There must be at least two choices!');
                    return null;
                }
                var hasCorrectChoice = false;
                angular.forEach(quiz.choices, function (v, k) {
                    if (v.correct) {
                        hasCorrectChoice = true;
                    }
                });
                if (!hasCorrectChoice) {
                    showToast('There must be at least one correct answer!');
                    return null;
                }
            } else {
                if (!quiz.answer) {
                    showToast('You must input the correct answer of this quiz!');
                    return null;
                }
            }
            return quiz;
        }

        function createQuiz(quiz) {
            QuizService.createQuiz(quiz).then(function (response) {
                $rootScope.back();
            }, function (response) {
                if (response.status === 401) {
                    showLoginNotificationToast();
                }
            });
        }

        function uploadImage(image) {
            return Upload.upload({
                url: 'https://api.imgur.com/3/image',
                headers: {
                    Authorization: 'Client-ID 5055060f6560623'
                },
                data: {
                    image: image
                }
            });
        }

        function showLoginNotificationToast() {
            $rootScope.showLoginSignUpDialog();
            showToast('Please log in before creating quiz!');
        }

        function showToast(msg) {
            var toast = $mdToast.simple()
                .textContent(msg)
                .position('top right')
                .action('OK');
            $mdToast.show(toast);
        }
    }

}());