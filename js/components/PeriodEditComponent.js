/**
 * Created by Simon Hohl on 12.04.17.
 */

angular.module('chronontology.components')
    .component('periodEdit',{
        templateUrl: '../../partials/period/edit.html',
        bindings:
        {
            originalPeriod: '<',
            gazetteerRelations: '<',
            internalRelations: '<',
            document: '<',
            relatedDocuments: '<',
            onSave: '&'
        },
        controller: function(chronontologySettings) {
            var _this = this;

            _this.validTypes = chronontologySettings.validTypes;
            _this.validSubtypes = chronontologySettings.validSubtypes;
            _this.validProvenances = chronontologySettings.validProvenances;

            _this.$onChanges = function() {
                if(!_this.originalPeriod){
                    return;
                }
                _this.period = angular.copy(_this.originalPeriod);
            };

            _this.saveChanges = function () {
                _this.onSave({updatedPeriod: _this.period});
            };

            _this.reset = function () {
                _this.period = angular.copy(_this.originalPeriod);
            };

            _this.addLanguage = function () {
                var newLanguageInput = document.getElementById('language-input');
                _this.period.names.push({'lang':newLanguageInput.value, 'content':[]});
                newLanguageInput.value = "";
            };

            _this.removeLanguage = function(languageObject) {
                _this.period.names = _this.period.names
                    .filter(function (nameItem)
                    {
                        return nameItem['lang'] != languageObject['lang'];
                    });
            };

            _this.getLanguageIndex = function(languageObject) {
                return _this.period.names.findIndex(function(x){
                   return x['lang'] == languageObject['lang'];
                });
            };

            _this.addName = function (languageObject) {
                var newNameInput = document.getElementById('name-input-' + languageObject['lang']);
                var languageIndex = _this.getLanguageIndex(languageObject);
                _this.period.names[languageIndex]['content'].push(newNameInput.value);
                newNameInput.value = null;
            };

            _this.removeName = function(languageObject, contentString) {
                var languageIndex = _this.getLanguageIndex(languageObject);
                _this.period.names[languageIndex]['content'] = _this.period.names[languageIndex]['content']
                    .filter(function (x){
                    {
                        return contentString != x;
                    }
                })
            };

            _this.getContentIndex = function (languageObject, contentString) {
                var languageIndex = _this.getLanguageIndex(languageObject);
                return _this.period.names[languageIndex]['content'].findIndex(function(x){
                    return x == contentString;
                });
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
        }
    });