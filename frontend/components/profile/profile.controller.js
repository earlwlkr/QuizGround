(function () {
    'use strict';

    angular.module('app')
        .controller('ProfileController', ProfileController);

    function ProfileController($scope, AuthenticationService) {
        $scope.user = AuthenticationService.currentUser;
        console.log('user', $scope.user);
        
    }

}());