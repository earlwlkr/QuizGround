(function() {
    'use strict';

    angular.module('app')
        .controller('MainController', MainController);

    function MainController($rootScope, $location, $scope, $mdDialog, AuthenticationService) {

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

        $scope.goToProfile = function() {
            $location.path('/profile');
        };
    }

})();
