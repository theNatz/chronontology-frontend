/**
 * Created by Simon Hohl on 12.04.17.
 */

angular.module('chronontology.components')
    .component('periodEdit',{
        templateUrl: '../../partials/period/edit.html',
        bindings:
        {
            originalPeriod: '<',
            onSave: '&'
        },
        controller: function(chronontologySettings) {
            var _this = this;

            _this.validTypes = chronontologySettings.validTypes;
            _this.validSubtypes = chronontologySettings.validSubtypes;
            _this.validProvenances = chronontologySettings.validProvenances;
            _this.internalRelations = chronontologySettings.internalRelations;
            _this.allenRelations = chronontologySettings.allenRelations;
            _this.gazetteerRelations = chronontologySettings.gazetteerRelations;

            _this.$onChanges = function() {
                if(!_this.originalPeriod){
                    return;
                }
                _this.copyOriginal();
            };

            _this.saveChanges = function () {
                _this.onSave({
                    updatedPeriod: _this.period
                });
            };

            _this.reset = function () {
                _this.copyOriginal();
            };

            _this.copyOriginal = function () {
                _this.period = angular.copy(_this.originalPeriod);
            };

            _this.addLanguage = function () {
                var newLanguageInput = document.getElementById('language-input');
                _this.period.names.push({'lang':newLanguageInput.value, 'content':[]});
                newLanguageInput.value = "";
            };

            _this.removeLanguage = function(lang) {
                delete _this.period.names[lang]
            };

            _this.addName = function (lang) {
                var newNameInput = document.getElementById('name-input-' + lang);
                _this.period.names[lang].push(newNameInput.value);
                newNameInput.value = null;
            };

            _this.removeName = function(lang, index) {
                _this.period.names[lang].splice(index, 1);
            };

            _this.toggleSubtypeSelection = function (typeString) {
                var typeIndex = _this.period.types.indexOf(typeString);
                if(typeIndex < 0){
                    _this.period.types.push(typeString)
                }
                else {
                    _this.period.types = _this.period.types.filter(function (x) {
                        return typeString != x;
                    })
                }
            };

            _this.selectAllSubtypes = function () {
                _this.period.types = _this.validSubtypes.slice(0);
            };

            _this.deselectAllSubtypes = function () {
                _this.period.types = [];
            };

            _this.removeTimespan = function(timespan) {
                _this.period.hasTimespan = _this.period.hasTimespan.filter(function(x){
                    return x['timeOriginal'] != timespan['timeOriginal'];
                });
            };

            _this.addTimespan = function() {

                if(!_this.period.hasTimespan) {
                    _this.period.hasTimespan = [];
                }

                var source = document.getElementById('timespan-source-input');
                var sourceUrl = document.getElementById('timespan-source-url-input');
                var original = document.getElementById('timespan-original-input');
                var calendar = document.getElementById('timespan-calendar-input');
                var beginAt = document.getElementById('timespan-begin-at-input');
                var beginAtPrecision = document.getElementById('timespan-begin-at-precision-input');
                var endAt = document.getElementById('timespan-end-at-input');
                var endAtPrecision = document.getElementById('timespan-end-at-precision-input');

                _this.period.hasTimespan.push({
                    "sourceOriginal": source.value,
                    "sourceURL": sourceUrl.value,
                    "timeOriginal": original.value,
                    "calendar": calendar.value,
                    "begin": {
                        "at": beginAt.value,
                        "atPrecision": beginAtPrecision.value
                    },
                    "end": {
                        "at": endAt.value,
                        "atPrecision": endAtPrecision.value
                    }
                });

                source.value = "";
                sourceUrl.value = "";
                original.value = "";
                calendar.value = "";
                beginAt.value = "";
                beginAtPrecision.value = "";
                endAt.value = "";
                endAtPrecision.value = "";
            };

            _this.addTag = function () {
                var newTagInput = document.getElementById('tag-input');

                if(_this.period.tags == undefined) {
                    _this.period.tags = [];
                }

                if(_this.period.tags.includes(newTagInput.value)){
                    newTagInput.value = "";
                    return;
                }

                if(newTagInput.value == "") return;

                _this.period.tags.push(newTagInput.value);
                newTagInput.value = "";
            };

            _this.removeTag = function (tag) {
                _this.period.tags = _this.period.tags.filter(function (x) {
                    return x != tag;
                })
            };

            _this.addRelation = function(relationName) {
                if(_this.period.relations == undefined) {
                    _this.period.relations = [];
                }

                if(_this.period.relations[relationName] == undefined) {
                    _this.period.relations[relationName] = [];
                }

                var newRelationInput = document.getElementById('relation-input-' + relationName);
                _this.period.relations[relationName].push(newRelationInput.value);
                newRelationInput.value = "";
            };
            _this.removeRelation = function(relationName, relation) {
                _this.period.relations[relationName] = _this.period.relations[relationName].filter(function(x){
                    return x != relation;
                });
            };

            _this.addGazetteerRelation = function(relationName) {
                if(_this.period[relationName] == undefined) {
                    _this.period[relationName] = [];
                }
                var newRelationInput = document.getElementById('gazetteer-relation-input-' + relationName);
                _this.period[relationName].push(newRelationInput.value);
                newRelationInput.value = "";
            };
            _this.removeGazetteerRelation = function(relationName, relation) {
                _this.period[relationName] = _this.period[relationName].filter(function(x){
                    return x != relation;
                });
            }

        }
    });
