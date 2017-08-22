'use strict';

angular.module('chronontology.filters')

	.filter('transl8Year', ['language',function(language){

        var filterFunction = function(nu) {

            if (typeof nu == 'undefined') return undefined;

			if (typeof nu === 'string' && isNaN(nu)) return nu;

			var num = (typeof nu === 'string' && !isNaN(nu)) ? +nu : nu;

			if (Math.abs(num) < 10000) return num.toString();

            if (language.currentLanguage()==COMPONENTS_GERMAN_LANG) {
                return num.toLocaleString(COMPONENTS_GERMAN_LANG+"-DE");
            } else {
                return num.toLocaleString(COMPONENTS_ENGLISH_LANG+"-US");
            }
        };
        filterFunction.$stateful=true;
        return filterFunction;
    }]);
