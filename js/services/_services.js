'use strict';

angular.module('chronontology.services', [])

.factory('d3', function() {
	return window.d3;
})
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
})
.factory('periodUtils', function() {
	var periodUtils = {

		buildTree: function(periods) {
			
			var tree = [];
			var map = {};
			var children = {};
			var roots = [];

			function populateNode(parent) {
	            var node = children[parent.resource.id];
	            if (node) {
		            parent.children = [node];
		            if (children.hasOwnProperty(node.resource.id)) populateNode(node);
		            while (node.resource.relations.hasOwnProperty('isFollowedBy')) {
		            	node = map[node.resource.relations['isFollowedBy'][0]];
		            	parent.children.push(node);
		            	if (children.hasOwnProperty(node.resource.id)) populateNode(node);
		            }
		        }
        	}

        	console.log("periods", periods);

			if (!periods) return;

			// build index and determine root
			periods.forEach(function(p) {
				map[p.resource.id] = p;
				if (!p.resource.relations.hasOwnProperty('isPartOf') && !p.resource.relations.hasOwnProperty('follows')) {
					roots.push(p);
				}
				if (p.resource.relations.hasOwnProperty('isPartOf') && !p.resource.relations.hasOwnProperty('follows')) {
					children[p.resource.relations['isPartOf'][0]] = p;
				}
			});

			for (var id in children) {
				if (!map.hasOwnProperty(id)) {
					roots.push(children[id]);
					delete children[id];
				}
			}

			console.log("roots", roots);
			console.log("children", children);
			console.log("map", map);

			// traverse tree
			for (var i = 0; i < roots.length; i++) {				
				var node = roots[i];
				console.log("node", node);
				populateNode(node);
				tree.push(node);
				while (node.resource.relations.hasOwnProperty('isFollowedBy')) {
					node = map[node.resource.relations['isFollowedBy'][0]];
					if (node) {
						populateNode(node);
						tree.push(node);
					} else {
						break;
					}
				}
			};

			return tree;

		}

	}

	return periodUtils;

});