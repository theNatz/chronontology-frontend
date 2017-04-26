'use strict';

angular.module('chronontology.controllers')
    .controller('MenuController', ['$scope', '$uibModal', '$location', 'authService', '$window',
        function ($scope, $uibModal, $location, authService, $window) {
            $scope.user = authService.getUser();

            $scope.currentPath = $location.path();
            $scope.$on("$locationChangeSuccess", function () {
                $scope.currentPath = $location.path();
            });

            $scope.openLoginModal = function () {
                var modalInstance = $uibModal.open({
                    component: 'Login',
                    resolve: {
                        user: function() {
                            return $scope.user;
                        }
                    }
                });

                modalInstance.result.then(function (user) {
                    $window.location.reload();
                });
            };

            $scope.logout = function () {
                authService.clearCredentials();
                $scope.user = authService.getUser();
                $window.location = '/';
            }
        }]);