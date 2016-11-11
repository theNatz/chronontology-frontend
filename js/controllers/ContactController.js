'use strict';

angular.module('chronontology.controllers')

.controller('ContactController', ['$scope','$http', function($scope, $http) {

	$scope.success = false;
	$scope.error = "";

	$scope.submit = function () {
        var userData = $scope.usrData;
        var userDataJson = {};

		//create proper json
		angular.forEach(userData, function(value, key){
			userDataJson[key] = value;
		});
		userDataJson['to'] = "idaiContact";

		$http.post('/data/mail', userDataJson).then( function() {
				$scope.success = true;
				$scope.error = "";
		}, function(errorMessage) {
			$scope.error = errorMessage;
		});
	}
}]);