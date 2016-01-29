'use strict';

angular.module('chronontology.directives', [])

  .directive('timeline', function(periodUtils) {
    return {
      restrict: 'EA',
      scope: { periods: '=' },
      templateUrl: 'partials/timeline.html',
      link: function(scope, element, attrs) {

        scope.tree = [];

        scope.buildTree = function() {

          scope.tree = periodUtils.buildTree(scope.periods);

        };

        scope.$watch('periods', function(periods) {
          scope.buildTree();
        });

      }
    };
  }

);