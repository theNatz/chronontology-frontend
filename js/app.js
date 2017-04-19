'use strict';

angular.module('chronontology', [
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
    'chronontology.filters',
    'chronontology.components'
])
    .config(['$routeProvider', '$locationProvider', '$compileProvider', '$httpProvider',
        function ($routeProvider, $locationProvider, $compileProvider, $httpProvider) {

            $locationProvider.html5Mode(true);

            $httpProvider.defaults.cache = true;
            $routeProvider
                .when('/', {templateUrl: 'partials/homepage.html'})
                .when('/search', {templateUrl: 'partials/search.html'})
                .when('/period/:id', {templateUrl: 'partials/period.html'})
                .when('/thesaurus/:provenance', {templateUrl: 'partials/thesaurus.html'})
                .when('/about', {templateUrl: 'partials/about.html'})
                .when('/contact', {templateUrl: 'partials/contact.html'})

	}
]).constant('chronontologySettings', {
	baseUri: "http://chronontology.dainst.org",
    geowidgetURL: "http://chronontology.i3mainz.hs-mainz.de/spatialapi/geowidget",
	internalRelations: [
		"isSenseOf", "hasSense",
		"isPartOf", "hasPart",
		"isListedIn", "lists",
		"follows", "isFollowedBy",
		"sameAs",
		"isSimilarTo"
	],
	gazetteerRelations: [
		"isNamedAfter",
		"hasCoreArea",
		"spatiallyPartOfRegion"
	],
	allenRelations: [
		"includes", "occursDuring",
		"meetsInTimeWith", "isMetInTimeBy",
		"occursBefore", "occursAfter",
		"isEqualInTimeTo",
		"starts", "isStartedBy",
		"finishes", "isFinishedBy",
		"overlapsInTimeWith", "isOverlappedInTimeBy"
	],
    validTypes: [
        'period'
    ],
    validSubtypes: [
        'alle Bedeutungen', 'kulturell', 'pottery style', 'politisch', 'Chronological subdivision',
        'Geological Epoch', 'Geological Period', 'Geological Era', 'material culture'
    ],
    validProvenances: [
        'chronontology', 'Arachne', 'aat'
    ]
}).constant('componentsSettings', {
    transl8Uri: 'https://arachne.dainst.org/transl8/translation/jsonp?application=chronontology_frontend&application=shared&lang={LANG}&callback=JSON_CALLBACK',
    // searchUri: 'https://arachne.dainst.org/data/suggest?q=',
    mailTo: 'idai.chronontology@dainst.org'
}).run(['$rootScope', function($rootScope) {

}]);
