'use strict';

angular.module('chronontology.controllers')
    .controller("PageController", function ($routeParams, $scope) {
        $scope.pagePath = 'pages/' + $routeParams.page + '.html';
    });
