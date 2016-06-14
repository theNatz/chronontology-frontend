'use strict';

angular.module('chronontology.services', [])

.factory('d3', function() {

	return window.d3;

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
		            while (node.resource.derived.hasOwnProperty('meetsInTimeWith')) {
		            	node = map[node.resource.derived['meetsInTimeWith']];
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
				if (!p.resource.hasOwnProperty('fallsWithin') && !p.resource.derived.hasOwnProperty('isMetInTimeBy')) {
					roots.push(p);
				}
				if (p.resource.hasOwnProperty('fallsWithin') && !p.resource.derived.hasOwnProperty('isMetInTimeBy')) {
					children[p.resource['fallsWithin']] = p;
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
				while (node.resource.derived.hasOwnProperty('meetsInTimeWith')) {
					node = map[node.resource.derived['meetsInTimeWith']];
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