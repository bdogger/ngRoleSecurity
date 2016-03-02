'use strict';

angular.module('testSecurityService', ['ngRoleSecurity', 'ngRoute',])
    .config(function ($routeProvider, securityConfig) {
        securityConfig.authoritiesUrl = 'http://localhost/me/authorities';
        securityConfig.forbiddenRoute = '/access-denied';
    });

describe('run: $locationChangeStart', function () {

    // load the service's module
    beforeEach(module('testSecurityService'));

    // instantiate service
    var $securityService, $sessionStorage, $location, $rootScope, securityConfig;

    beforeEach(inject(function (_$location_, _$sessionStorage_, _$securityService_, _$rootScope_, _$route_, _securityConfig_) {
        $securityService = _$securityService_;
        $location = _$location_;
        securityConfig = _securityConfig_;
        $sessionStorage = _$sessionStorage_;
        $rootScope = _$rootScope_;
    }));


    it('expects the route to load when no permission is required', function () {
        $location.path('/unsecured');

        $rootScope.$broadcast('$routeChangeStart', {originalPath: '/secured-admin'});
        $rootScope.$digest();

        expect($location.path()).toBe('/unsecured');
    });

    it('expects the route to change to permission denied when the user does not have required permission', function () {
        $sessionStorage.authorities = [];

        $rootScope.$broadcast('$routeChangeStart', {originalPath: '/secured-admin', requiredRole: ['ADMIN']});
        $rootScope.$digest();

        expect($location.path()).toBe('/access-denied');
    });

    it('expects the route to not change when the user has the required permission', function () {
        $sessionStorage.authorities = ['ADMIN'];

        $rootScope.$broadcast('$routeChangeStart', {originalPath: '/secured-admin', requiredRole: ['ADMIN']});
        $rootScope.$digest();

        expect($location.path()).toBe('/secured-admin');
    });

    it('expects the route to not change when the user has the required permission with route params', function () {
        $sessionStorage.authorities = ['ADMIN'];

        $rootScope.$broadcast('$routeChangeStart', {
            originalPath: '/secured-admin/:param2/param/:param',// add path params that will ensure the replace is not too greedy
            requiredRole: ['ADMIN'],
            params: {param2: 'param2', param: 'param'},
            pathParams: {param2: 'param2', param: 'param'},
        });
        $rootScope.$digest();

        expect($location.path()).toBe('/secured-admin/param2/param/param');
    });
});