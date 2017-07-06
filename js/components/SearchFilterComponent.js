angular.module('chronontology.components')
    .component('searchFilter',{
        templateUrl: '../../partials/search/filter.html',
        bindings:
        {
            facette: '<',
            facets: '<',
            query: '<'
        },
        controller: function() {
            this.getFacetValues = function(){
                // aus der Frontend-URI: ohne "resource."
                var fq = this.query.fq;
                if (fq == null) return "";
                if (typeof fq === 'string') return "&fq="+fq;
                return "&fq=" + fq.join("&fq=");
            }

            this.getFacetValuesExcept = function(facette, facetvalue){
                var fq = this.query.fq;
                var facettenwert = facette + ":" + facetvalue;
                // 1. sowieso kein Facettenwert ausgewählt?
                if (fq == null) return "";
                // 2. genau ein Facettenwert ausgewählt?
                if (typeof fq === 'string') {
                    if (facettenwert === fq) {
                        return "";
                    } else {
                        return "&fq="+fq;
                    }
                }
                // 3. mehr als ein Facettenwert ausgewählt?
                if (fq.indexOf(facettenwert) > -1) {
                    var fqOhne = angular.copy(fq)
                    fqOhne.splice(fq.indexOf(facettenwert), 1);
                    return "&fq=" + fqOhne.join("&fq=");
                } else {
                    return "&fq=" + fq.join("&fq=");
                }
            }
            this.isFacetValueSelected = function(facette, facetvalue){
                var zusammen = facette + ":" + facetvalue;
                var fq = this.query.fq;
                if (fq == null) return false;
                if (typeof fq === 'string') return (zusammen === fq);
                return (fq.indexOf(zusammen) > -1);
            }
            this.addResource = function(text){
                return "resource." + text;
            }

            this.addOrRemoveFacetValue = function(facette, facetvalue){
                if (this.isFacetValueSelected(facette, facetvalue)) {
                    return this.getFacetValuesExcept(facette, facetvalue);
                } else {
                    return this.getFacetValues()+"&fq="+facette+":"+facetvalue;
                }
            }
        }
    });
