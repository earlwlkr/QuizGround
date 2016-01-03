(function () {
    'use strict';

    angular.module('app')
        .factory('ProfileService', ProfileService);

    function ProfileService($http, $cookies, ServerInfo, AuthenticationService) {
        var updateUrl = ServerInfo.baseUrl + '/api/users/',
            ProfileService = {};

        ProfileService.updateInfo = function (user) {
            return $http.put(updateUrl + user._id, {
                firstName: user.firstName,
                lastName: user.lastName,
                birthDay: user.birthDay,
                avatar: user.avatar
            }, AuthenticationService.getBearerHeader());
        };

        return ProfileService;
    }

}());