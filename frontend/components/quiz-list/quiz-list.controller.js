(function () {
    'use strict';

    angular.module('app')
        .controller('QuizListController', QuizListController);

    function QuizListController($scope, $mdToast, $timeout, $mdSidenav, QuizService, AuthenticationService, socket) {
        socket.on('quizzes:new', function (data) {
            $scope.quizzes.splice(0, 0, data);
        });
        QuizService.getAllQuizzes().then(function (response) {
            $scope.quizzes = response.data;
        });

        $scope.updateQuizSubmitButtonStatus = function (quiz) {
            quiz.showSubmitButton = false;
            angular.forEach(quiz.choices, function (value) {
               if (value.userChoice) {
                   quiz.showSubmitButton = true;
               }
            });
        };

        $scope.submitAnswer = function (quiz) {
            QuizService.submitQuiz(quiz).then(function (res) {
               if (res.data === false) {
                   showToast('Wrong answer!');
               } else {
                   showToast('Right answer!');
                    AuthenticationService.getUserInfo();
               }
            });
        };

        function showToast(msg) {
            var toast = $mdToast.simple()
                .textContent(msg)
                .position('top right')
                .action('OK');
            $mdToast.show(toast);
        };

        // Get categories
        $scope.categories = null;
        QuizService.getAllCategories().then(function (response) {
            $scope.categories = response.data;
        });

        // Show side nav
        $scope.toggleRight = buildToggler('right');
        $scope.isOpenRight = function(){
          return $mdSidenav('right').isOpen();
        };
        /**
         * Supplies a function that will continue to operate until the
         * time is up.
         */
        function debounce(func, wait, context) {
          var timer;
          return function debounced() {
            var context = $scope,
                args = Array.prototype.slice.call(arguments);
            $timeout.cancel(timer);
            timer = $timeout(function() {
              timer = undefined;
              func.apply(context, args);
            }, wait || 10);
          };
        };

        function buildToggler(navID) {
          return function() {
            $mdSidenav(navID)
              .toggle();
          }
        };

        $scope.close = function () {
          $mdSidenav('right').close();
        };

        $scope.selectCategory = function (category) {
          console.log(category);
        }
    }
}());