'use strict';

angular.module('chronontology.services', [])

// requests to external systems should not contain the
// chronontology authorization

.factory('ChronontologyInterceptor', function () {
    var externalResourcePattern = /^https?:\/\//i;
	return {
		request: function (config) {
			if(externalResourcePattern.test(config.url)) {
				config.headers.Authorization = undefined;
			}
			return config;
        }
	}
});
