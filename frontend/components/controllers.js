(function() {
    'use strict';

    angular.module('app')
        .controller('MainController', MainController);

    function MainController($rootScope, $location, $mdToast, $scope, $mdDialog, AuthenticationService) {

        function updateCurrentUserInfo() {
            $rootScope.user = AuthenticationService.currentUser;
            $scope.isLoggedIn = true;
        }

        AuthenticationService.registerObserverCallback(updateCurrentUserInfo);

        $scope.logout = function () {
            if ($scope.isLoggedIn) {
                AuthenticationService.logout();
                $scope.isLoggedIn = false;
                $rootScope.user = null;
            }
        };

        $rootScope.showLoginSignUpDialog = showLoginSignUpDialog;
        $rootScope.showLoginNotificationToast = showLoginNotificationToast;

        var history = [];

        $rootScope.$on('$routeChangeSuccess', function() {
            history.push($location.$$path);
        });

        $rootScope.back = function () {
            var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
            $location.path(prevUrl);
        };

        function showLoginSignUpDialog() {
            $mdDialog.show({
                controller: 'AuthenticationController',
                templateUrl: '/components/authentication/authentication.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        }

        function showLoginNotificationToast() {
            $rootScope.showLoginSignUpDialog();
            showToast('Please log in before doing this!');
        }

        $rootScope.goToProfile = function(userId) {
            $location.path('/profile/' + userId);
        };

        function showToast(msg) {
            var toast = $mdToast.simple()
                .textContent(msg)
                .position('top right')
                .action('OK');
            $mdToast.show(toast);
        }
    }
})();
