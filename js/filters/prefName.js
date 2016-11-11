'use strict';

angular.module('chronontology.filters')

	.filter('prefName',['language', function(language) {

		return function(names) {

			// if names is non-empty then we assume there is 
			// at least one name for each given language

			var browserlang = language.browserPrimaryLanguage();
			var availableLanguages = names.map(function(line) { return line.lang; });
			var browserlangPosition = availableLanguages.indexOf(browserlang);
			var enPosition = availableLanguages.indexOf('en');

			if(names.length > 0) {
				if (browserlangPosition > -1) {
					// user-preferred language is available
					return names[browserlangPosition].content[0];
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
