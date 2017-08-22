'use strict';

angular.module('chronontology.filters')

	.filter('prefName',['language', function(language) {

		return function(names) {
			// if names is non-empty then we assume there is
			// at least one name for each given language

			if(names != undefined && Object.keys(names).length > 0) {
                var currentLang = language.currentLanguage();

                if (names[currentLang] && names[currentLang].length > 0) {
					// user-preferred language is available
					return names[currentLang][0];
				}
				else if (names['en'] && names['en'].length > 0) {
					// at least English is available
					return names['en'][0];
				} else if (names['de'] && names['de'].length > 0) {
					// fall back to german
					return names['de'][0];
				}
				else {
					// at least any language is available
				    return names[Object.keys(names)[0]][0];
				}
			}
			else {
			    return "(kein Name)";
			}
		}
    }]);
