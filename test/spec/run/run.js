'use strict';

angular.module('testSecurityService', ['ngRoleSecurity', 'ngRoute',])
    .config(function ($routeProvider, securityConfig) {
        $routeProvider
            .when('/secured-admin', {
                template: '<div>Admins Only</div>',
                requiredRole: ['ADMIN']
            })
            .when('/unsecured', {
                template: '<div>no security</div>'
            });

        securityConfig.authoritiesUrl = 'http://localhost/me/authorities';
        securityConfig.forbiddenRoute = '/access-denied';
    });

describe('run: $locationChangeStart', function () {

    // load the service's module
    beforeEach(module('testSecurityService'));

    // instantiate service
    var $securityService, $localStorage, $location, $rootScope, securityConfig;

    beforeEach(inject(function (_$location_, _$localStorage_, _$securityService_, _$rootScope_, _$route_, _securityConfig_) {
        $securityService = _$securityService_;
        $location = _$location_;
        securityConfig = _securityConfig_;
        $localStorage = _$localStorage_;
        $rootScope = _$rootScope_;
    }));


    it('expects the route to load when no permission is required', function () {
        $location.path('/unsecured');

        $rootScope.$broadcast('$routeChangeStart', {originalPath: '/secured-admin'});

        expect($location.path()).toBe('/unsecured');
    });

    it('expects the route to change to permission denied when the user does not have required permission', function() {
        $localStorage.authorities = [];

        $rootScope.$broadcast('$routeChangeStart', {originalPath: '/secured-admin', requiredRole: ['ADMIN']});

        expect($location.path()).toBe('/access-denied');
    });

    it('expects the route to change to not change when the user does the required permission', function() {
        $localStorage.authorities = ['ADMIN'];

        $rootScope.$broadcast('$routeChangeStart', {originalPath: '/secured-admin', requiredRole: ['ADMIN']});

        expect($location.path()).toBe('/secured-admin');
    });
});