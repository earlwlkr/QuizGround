(function() {
    'use strict';

    angular.module('app')
        .controller('MainController', MainController);

    function AuthenticationController($scope, $mdDialog, AuthenticationService) {
        $scope.isLogin = true;
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        function login() {
            AuthenticationService.login($scope.user)
                .then(function (response) {
                    $scope.loading = false;
                    AuthenticationService.handleResponse(response.data);
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
                $scope.loginError = 'Passwords do not match.';
                return;
            }
            $scope.loading = true;
            AuthenticationService.signup($scope.user)
                .then(function (response) {
                    if (response.data.error) {
                        $scope.loading = false;
                        $scope.loginError = response.data.message;
                    } else {
                        login();
                    }
                }, function () {
                    $scope.loading = false;
                    $scope.loginError = 'Error during register.';
                });
        };
    }

    function MainController($scope, $mdDialog, AuthenticationService) {
        $scope.logout = function () {
            if ($scope.isLoggedIn) {
                AuthenticationService.token = null;
            }
        };
        $scope.showLoginSignUpDialog = function () {
            $mdDialog.show({
                controller: AuthenticationController,
                templateUrl: '/components/authentication/authentication.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };
    }

})();
