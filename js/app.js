'use strict';

angular.module('chronontology',[
	'ui.bootstrap',
	'ui.scroll.jqlite',
	'ui.scroll',
	'ngRoute',
	'ngResource',
	'ui.scroll.jqlite',
	'ui.scroll',
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
			.when('/', { templateUrl: 'partials/homepage.html'})
			.when('/search', {templateUrl: 'partials/search.html'})
			.when('/period/:id', {templateUrl: 'partials/period.html'})
			.when('/thesaurus/:provenance', {templateUrl: 'partials/thesaurus.html'})

	}
]).constant('chronontologySettings', {
	baseUri: "http://chronontology.dainst.org",
	geoFrameBaseUri: "http://chronontology.i3mainz.hs-mainz.de/stc/W_ChronOntologyGEO",
	relations: {
		"follows": "Folgt auf",
		"isFollowedBy": "Wird gefolgt von",
		"isPartOf": "Ist Teil von",
		"hasPart": "Hat Unterteilungen"
	}
}).constant('componentsSettings', {
	transl8Uri: "http://bogusman01.dai-cloud.uni-koeln.de/transl8/translation/jsonp?application=arachne4_frontend&lang={LANG}&callback=JSON_CALLBACK"
}).run(['$rootScope', function($rootScope) {
    
}]);
