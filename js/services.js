'use strict';

angular.module('chronontology.services', [])

.factory('d3', function() {

	return window.d3;

})

.factory('Backend', function($resource) {

	return $resource(':id', { id: '@id' }, { query: { isArray: false } });

})

.factory('periodUtils', function() {

	var periodUtils = {

		buildTree: function(periods) {
			
			var tree = [];
			var map = {};
			var children = {};
			var roots = [];

			function populateNode(parent) {
	            var node = children[parent['@id']];
	            if (node) {
		            parent.children = [node];
		            if (children.hasOwnProperty(node['@id'])) populateNode(node);
		            while (node.hasOwnProperty('meetsInTimeWith')) {
		            	node = map[node['meetsInTimeWith']];
		            	parent.children.push(node);
		            	if (children.hasOwnProperty(node['@id'])) populateNode(node);
		            }
		        }
        	}

        	console.log("periods", periods);

			if (!periods) return;

			// build index and determine root
			periods.forEach(function(p) {
				map[p['@id']] = p;
				if (!p.hasOwnProperty('fallsWithin') && !p.hasOwnProperty('isMetInTimeBy')) {
					roots.push(p);
				}
				if (p.hasOwnProperty('fallsWithin') && !p.hasOwnProperty('isMetInTimeBy')) {
					children[p['fallsWithin']] = p;
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
				while (node.hasOwnProperty('meetsInTimeWith')) {
					node = map[node['meetsInTimeWith']];
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

})

;