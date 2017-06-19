'use strict';

angular.module('chronontology.services')
// singleton service for authentication, stores credentials in browser cookie
// if cookie is present the stored credentials get sent with every backend request
.service('authService', ['$http', '$filter', '$cookieStore',
    function($http, $filter, $cookieStore) {

    // initialize to whatever is in the cookie, if anything
    if ($cookieStore.get('chronontology-authdata')) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookieStore.get('chronontology-authdata');
    } else {
        delete $http.defaults.headers.common['Authorization'];
    }

    // TODO: 'datasetgroups' is an Arachne 4 term:
    // what is the chronontology equivalent and how should it be implemented?
    return {

        setCredentials: function (username, password, successMethod, errorMethod) {
            var encoded = $filter('base64')(username + ':' + password);

            $http.get('/data/user/login', { headers: { 'Authorization': 'Basic ' + encoded } })
                .success(function(response) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                    $cookieStore.put('chronontology-authdata', encoded);
                    $cookieStore.put('chronontology-user', { username: username, groupID: response.groupID });

                    if (response.datasetGroups !== undefined) {
                        $cookieStore.put('chronontology-datasetgroups', response.datasetGroups);
                    }

                    successMethod();
                }).error(function(response) {
                    errorMethod(response);
                });
        },

        clearCredentials: function () {
            document.execCommand("ClearAuthenticationCache");
            $cookieStore.remove('chronontology-authdata');
            $cookieStore.remove('chronontology-user');
            $cookieStore.remove('chronontology-datasetgroups');
            delete $http.defaults.headers.common['Authorization'];
        },

        getUser: function() {
            return $cookieStore.get('chronontology-user');
        },

        getDatasetGroups: function() {
            return $cookieStore.get('chronontology-datasetgroups') || [];
        }
    };
}]);