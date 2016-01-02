(function () {
    'use strict';

    angular.module('app')
        .directive('uploadImage', UploadImageDirective);

    function UploadImageDirective() {
        var directive = {
            restrict: 'E',
            scope: {
                ngModel: '='
            },
            templateUrl: 'components/upload.file.template.html',
            link: uploadImageLink
        };
        return directive;
    }

    function uploadImageLink(scope, element, attrs) {
        var input = angular.element(element[0].querySelector('#fileInput'));
        var button = angular.element(element[0].querySelector('#uploadButton'));

        if (input.length && button.length) {
            button.bind('click', function (e) {
                document.getElementById('fileInput').click();
            });
        }

        scope.removeQuizImage = function () {
            if (scope.ngModel) {
                scope.ngModel = null;
            }
        };

    }
}());
