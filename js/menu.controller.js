'use strict';

angular.module('chronontology.controllers')
    .controller('MenuController', ['$scope', '$uibModal', '$location',
        function ($scope, $uibModal, $location) {
            $scope.currentPath = $location.path();
            $scope.$on("$locationChangeSuccess", function () {
                $scope.currentPath = $location.path();
                console.log($scope.currentPath);
            });
        }]);