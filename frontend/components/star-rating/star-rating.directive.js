(function () {
    'use strict';

    angular.module('app')
        .directive('starRating', starRating);

    function starRating() {
	    return {
	        restrict: 'A',
	        templateUrl: 'components/star-rating/star-rating.html',
	        scope: {
                ngModel: '=',
	            ratingValue: '=',
	            max: '=',
	            onRatingSelected: '&'
	        },
	        link: startRatingLink
    	}
	}
	function startRatingLink (scope, elem, attrs) {
        if (scope.max == undefined) {
            scope.max = 5;
        }
        if (scope.ratingValue == undefined) {
            scope.ratingValue = scope.ngModel;
        }
        var updateStars = function () {
            scope.stars = [];
            for (var i = 0; i < scope.max; i++) {
                scope.stars.push({
                    filled: i < scope.ratingValue
                });
            }
        };

        scope.toggle = function (index) {
            scope.ratingValue = index + 1;
            scope.onRatingSelected({
                rating: index + 1
            });
        };

        scope.$watch('ratingValue', function (oldVal, newVal) {
            if (newVal) {
                updateStars();
            }
        });
    }
})();
