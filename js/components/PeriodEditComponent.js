/**
 * Created by Simon Hohl on 12.04.17.
 */

angular.module('chronontology.components')
    .component('periodEdit',{
        templateUrl: '../../partials/period/edit.html',
        bindings:
        {
            originalPeriod: '<',
            internalRelations: '<',
            gazetteerRelations: '<',
            document: '<',
            relatedDocuments: '<',
            onSave: '&'
        },
        controller: function() {
            var _this = this;
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


            _this.knownTypes = [
                'alle Bedeutungen', 'viele Bedeutungen', 'Bedeutungen', 'kaum Bedeutungen', 'keinerlei Bedeutungen'
            ];

            _this.toggleTypeSelection = function (typeString) {
                var typeIndex = _this.period.types.indexOf(typeString);
                if(typeIndex < 0){
                    _this.period.types.push(typeString)
                }
                else {
                    _this.period.types = _this.period.types.filter(function (x) {
                        return typeString != x;
                    })
                }
            }

        }
    });