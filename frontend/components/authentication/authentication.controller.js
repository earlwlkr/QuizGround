(function () {
    'use strict';

    angular.module('app')
        .controller('AuthenticationController', AuthenticationController);

    function AuthenticationController($scope, $mdDialog, AuthenticationService) {
        $scope.selectedIndex = 0;
        initClient();

        // The Sign-In client object.
        var auth2;

        function initClient() {
            gapi.load('auth2', function () {
                /**
                 * Retrieve the singleton for the GoogleAuth library and set up the
                 * client.
                 */
                auth2 = gapi.auth2.init({
                    client_id: '1038678345021-2j1edq24554geekqvmqhgntvas7trpoc.apps.googleusercontent.com'
                });

                // Attach the click handler to the sign-in button
                auth2.attachClickHandler('googleSignInButton', {}, onSuccess, onFailure);
            });
        }

        var onSuccess = function (user) {
            var profile = user.getBasicProfile();
            console.log('Signed in as ' + profile.getName());
            $scope.loading = true;
            var nameSplits = profile.getName().split(' ', 2);
            var firstName = nameSplits[0];
            var lastName = nameSplits[1];
            AuthenticationService.googleLogin(profile.getEmail(), firstName, lastName)
                .then(function (response) {
                    $scope.loading = false;
                    AuthenticationService.handleResponse(response.data);
                    $mdDialog.hide();
                }, function () {
                    $scope.loading = false;
                    $scope.loginError = 'Login failed.';
                });
        };

        var onFailure = function (error) {
            console.log(error);
        };

        $scope.next = function () {
            $scope.selectedIndex = Math.min($scope.selectedIndex + 1, 1);
        };
        $scope.previous = function () {
            $scope.selectedIndex = Math.max($scope.selectedIndex - 1, 0);
        };

        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        function login() {
            if (!$scope.user || !$scope.user.email || !$scope.user.password) {
                $scope.loading = false;
                $scope.loginError = 'Please enter email and password.';
                return;
            }
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
            $scope.loading = true;
            login();
        };
        $scope.signup = function () {
            if ($scope.user.password !== $scope.user.confirmPassword) {
                $scope.loginError = 'Passwords don\'t match.';
                return;
            }
            if (!$scope.user.firstName || !$scope.user.lastName) {
                $scope.loginError = 'Please enter first name and last name.';
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
                    $scope.loginError = 'Error.';
                });
        };
    }

}());