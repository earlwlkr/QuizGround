(function () {
    'use strict';

    angular.module('app')
        .controller('ProfileController', ProfileController);

    function ProfileController($scope, $location, $mdToast, AuthenticationService, ProfileService) {
        $scope.user = copyUser(AuthenticationService.currentUser);
        if (!$scope.user) {
        	$location.path('/');
        } else {
        	$scope.user.birthDay = new Date($scope.user.birthDay);
        }

        $scope.isEdit = false;
        
        $scope.edit = function() {
        	$scope.isEdit = true;
        };

        $scope.update = function (user) {
        	ProfileService.updateInfo(user).then(function (res) {
        		showToast('Updated successfully!');
        	});
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
		        firstName: user.firstName,
		        lastName: user.lastName,
		        email: user.email,
		        password: user.password,
		        avatar: user.avatar,
		        joinDate: user.joinDate,
		        birthDay: user.birthDay
		    };
        }
    }

}());