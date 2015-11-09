'use strict';

var quizGroundControllers = angular.module('quizGroundControllers', [
    'ngMaterial', 'ngMessages', 'quizGroundServices'
]);

function CredentialController($scope, $mdDialog, AuthService) {
    $scope.isLogin = true;
    $scope.hide = function () {
        $mdDialog.hide();
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    function login() {
        AuthService.login($scope.user)
            .then(function (response) {
                $scope.loading = false;
                AuthService.handleResponse(response.data);
                $mdDialog.hide();
            }, function () {
                $scope.loading = false;
                $scope.loginError = 'Login failed.';
            });
    }
    $scope.login = function () {
        if (!$scope.isLogin) {
            $scope.isLogin = true;
            return;
        }
        $scope.loading = true;
        login();
    };
    $scope.signup = function () {
        if ($scope.isLogin) {
            $scope.isLogin = false;
            return;
        }
        if ($scope.user.password !== $scope.user.confirmPassword) {
            $scope.loginError = 'Mật khẩu nhập lại không trùng khớp.';
            return;
        }
        $scope.loading = true;
        AuthService.signup($scope.user)
            .then(function (response) {
                if (response.data.error) {
                    $scope.loading = false;
                    $scope.loginError = response.data.message;
                } else {
                    login();
                }
            }, function () {
                $scope.loading = false;
                $scope.loginError = 'Đã có lỗi xảy ra khi đăng ký tài khoản.';
            });
    };
}

quizGroundControllers.controller('MainController', ['$scope', '$mdDialog', 'AuthService', 'QuizService',
    function ($scope, $mdDialog, AuthService, QuizService) {
        $scope.logout = function () {
            if ($scope.isLoggedIn) {
                AccountService.token = null;
                StudentService.students = null;
            }
        };
        $scope.showLoginSignUpDialog = function () {
            $mdDialog.show({
                controller: CredentialController,
                templateUrl: 'partials/login-signup-dialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };
    }]);

quizGroundControllers.controller('QuizListController', ['$scope', 'QuizService',
    function ($scope, QuizService) {
        QuizService.getAllQuizzes().then(function (response) {
           $scope.quizzes = response.data;
        });
    }]);

quizGroundControllers.controller('QuizEditController', ['$scope', 'QuizService',
    function ($scope, QuizService) {
        $scope.save = function (quiz) {
          QuizService.createQuiz(quiz).then(function (response) {

          });
        };
    }]);
