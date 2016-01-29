'use strict';

angular.module('chronontology',[
	'ui.bootstrap',
	'ngRoute',
	'ngResource',
	'idai.templates',
    'idai.components',
	'chronontology.services',
	'chronontology.directives',
	'chronontology.controllers',
	'chronontology.filters'
])
.config(['$routeProvider', '$locationProvider', '$compileProvider', '$httpProvider',
	function($routeProvider, $locationProvider, $compileProvider, $httpProvider) {

		$locationProvider.html5Mode(true);

		$httpProvider.defaults.cache = true;

		$routeProvider
			.when('/search', {templateUrl: 'partials/search.html'})
			.when('/period/:id', {templateUrl: 'partials/period.html'})
			.when('/thesaurus/:provenance', { templateUrl: 'partials/thesaurus.html' })

	}
]).constant('chronontologySettings', {

}).constant('componentsSettings', {
	transl8Uri: "http://bogusman01.dai-cloud.uni-koeln.de/transl8/translation/jsonp?application=arachne4_frontend&lang={LANG}&callback=JSON_CALLBACK"
}).run(['$rootScope', function($rootScope) {
    
}]);
