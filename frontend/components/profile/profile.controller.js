(function () {
    'use strict';

    angular.module('app')
        .controller('ProfileController', ProfileController);

    function ProfileController($scope, $location, $mdToast, AuthenticationService, ProfileService, QuizService, Upload) {
        $scope.user = copyUser(AuthenticationService.currentUser);
        if (!$scope.user) {
            $location.path('/');
        } else {
            $scope.user.birthDay = new Date($scope.user.birthDay);
        }

        QuizService.getAllQuizzes(null, $scope.user._id).then(function (res) {
            $scope.quizzes = res.data;
        });

        $scope.isEdit = false;

        $scope.edit = function () {
            $scope.isEdit = true;
        };

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
                isAdmin: user.isAdmin
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