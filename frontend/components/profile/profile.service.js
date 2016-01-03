(function () {
    'use strict';

    angular.module('app')
        .factory('ProfileService', ProfileService);

    function ProfileService($http, $cookies, ServerInfo, AuthenticationService) {
        var updateUrl = ServerInfo.baseUrl + '/api/users/',
            ProfileService = {};

        var observerCallbacks = [];

        ProfileService.registerObserverCallback = function (callback) {
            observerCallbacks.push(callback);
        };

        ProfileService.updateInfo = function (user) {
            return $http.put(updateUrl + user._id, {
                firstName: user.firstName,
                lastName: user.lastName,
                birthDay: user.birthDay
            }, AuthenticationService.getBearerHeader());
        };

        function notifyObservers() {
            angular.forEach(observerCallbacks, function (callback) {
                callback();
            });
        }


        return ProfileService;
    }

}());