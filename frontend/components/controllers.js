(function() {
    'use strict';

    angular.module('app')
        .controller('MainController', MainController);

    function MainController($rootScope, $location, $scope, $mdDialog, AuthenticationService) {
        $scope.logout = function () {
            if ($scope.isLoggedIn) {
                AuthenticationService.token = null;
            }
        };
        $scope.showLoginSignUpDialog = function () {
            $mdDialog.show({
                controller: 'AuthenticationController',
                templateUrl: '/components/authentication/authentication.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };
        var history = [];

        $rootScope.$on('$routeChangeSuccess', function() {
            history.push($location.$$path);
        });

        $rootScope.back = function () {
            var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
            $location.path(prevUrl);
        };
    }

})();
