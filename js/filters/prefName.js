'use strict';

angular.module('chronontology.filters')

	.filter('prefName',['language', function(language) {

		return function(names) {
			// if names is non-empty then we assume there is
			// at least one name for each given language

			if(names != undefined && names.length > 0) {
                var currentLang = language.currentLanguage();
                var availableLanguages = names.map(function(line) { return line.lang; });
                var currentLangPosition = availableLanguages.indexOf(currentLang);
                var enPosition = availableLanguages.indexOf('en');

                if (currentLangPosition > -1) {
					// user-preferred language is available
					return names[currentLangPosition].content[0];
				}
				else if (enPosition > -1) {
					// at least English is available
					return names[enPosition].content[0];
				}
				else {
					// at least any language is available
				    return names[0].content[0];
				}
			}
			else {
			    return "(kein Name)";
			}			
		}
	}])
