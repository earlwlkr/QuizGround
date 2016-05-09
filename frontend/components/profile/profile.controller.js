(function () {
    'use strict';

    angular.module('app')
        .controller('ProfileController', ProfileController);

    function ProfileController($scope, $location, $mdToast, $routeParams,
                               AuthenticationService, ProfileService, QuizService, Upload) {
        function updateCurrentUserInfo() {
            if (AuthenticationService.currentUser) {
                $scope.canEdit = !(AuthenticationService.currentUser._id !== $scope.user._id
                && !AuthenticationService.currentUser.isAdmin);
            } else {
                $scope.canEdit = false;
            }
            if (!$scope.canEdit) {
                $scope.isEdit = false;
            }
        }

        AuthenticationService.registerObserverCallback(updateCurrentUserInfo);

        if (!AuthenticationService.currentUser) {
            $location.path('/');
        }

        if ($routeParams.userId !== AuthenticationService.currentUser._id) {
            AuthenticationService.getUserInfo($routeParams.userId)
                .then(function (response) {
                    $scope.user = response.data;
                    if (AuthenticationService.currentUser.isAdmin) {
                        $scope.canEdit = true;
                    } else {
                        $scope.canEdit = false;
                    }

                    if (!$scope.user) {
                        $location.path('/');
                    } else {
                        $scope.user.birthDay = new Date($scope.user.birthDay);
                        QuizService.getAllQuizzes(null, $scope.user._id).then(function (res) {
                            $scope.quizzes = res.data;
                        });
                    }
                });
        } else {
            $scope.user = copyUser(AuthenticationService.currentUser);
            $scope.canEdit = true;
            
            if (!$scope.user) {
                $location.path('/');
            } else {
                $scope.user.birthDay = new Date($scope.user.birthDay);
                QuizService.getAllQuizzes(null, $scope.user._id).then(function (res) {
                    $scope.quizzes = res.data;
                });
            }
        }

        $scope.update = function (user) {
            if ($scope.userImage) {
                uploadImage($scope.userImage).then(function (res) {
                    user.avatar = res.data.data.link;
                    ProfileService.updateInfo(user).then(function (res) {
                        showToast('Updated successfully!');
                        AuthenticationService.getUserInfo();
                    });
                });
            } else {
                ProfileService.updateInfo(user).then(function (res) {
                    showToast('Updated successfully!');
                    AuthenticationService.getUserInfo();
                });
            }
        };

        $scope.cancel = function () {
            $scope.user = copyUser(AuthenticationService.currentUser);
            $scope.isEdit = false;
        };

        function showToast(msg) {
            var toast = $mdToast.simple()
                .textContent(msg)
                .position('top right')
                .action('OK');
            $mdToast.show(toast);
        }

        function copyUser(user) {
            return {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
                avatar: user.avatar,
                joinDate: user.joinDate,
                birthDay: user.birthDay,
                score: user.score,
                answeredQuizzes: user.answeredQuizzes
            };
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
    }
}());