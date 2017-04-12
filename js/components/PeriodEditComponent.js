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
        }
    });
