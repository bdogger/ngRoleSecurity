'use strict';

angular.module('testSecurityService', ['ngRoleSecurity', 'ngRoute',])
    .config(function ($routeProvider, securityConfig) {
        $routeProvider
            .when('/secured-admin', {
                template: '<div>Admins Only</div>',
                allowedRoles: ['ADMIN']
            })
            .when('/unsecured', {
                template: '<div>no security</div>'
            });
        securityConfig.authoritiesUrl = 'http://localhost/me/authorities';
        securityConfig.forbiddenRoute = '/access-denied';
    });

describe('Service: $securityService', function () {

    // load the service's module
    beforeEach(module('testSecurityService'));

    // instantiate service
    var $securityService, $httpBackend, $localStorage, $location, securityConfig;

    beforeEach(inject(function (_$httpBackend_, _$location_, _$localStorage_, _$securityService_, _securityConfig_) {
        $httpBackend = _$httpBackend_;
        $securityService = _$securityService_;
        $localStorage = _$localStorage_;
        $location = _$location_;
        securityConfig = _securityConfig_;
    }));

    it('expects getRemoteAuthorities() to return the authorities', function () {
        $httpBackend.expectGET(
            'http://localhost/me/authorities'
        )
            .respond(['EMPLOYEE', 'MANAGER']);

        $securityService.getRemoteAuthorities();

        $httpBackend.flush();

        expect($localStorage.authorities[0]).toBe('EMPLOYEE');
        expect($localStorage.authorities[1]).toBe('MANAGER');
    });

    it('expects getRemoteAuthorities to call the callback function', function () {
        var count = 0;

        $httpBackend.expectGET(
            'http://localhost/me/authorities'
        )
            .respond(['EMPLOYEE', 'MANAGER']);

        $securityService.getRemoteAuthorities(function () {
            count++
        });

        $httpBackend.flush();
        expect(count).toBe(1);
    });

    it('expects getRemoteAuthorities() to do nothing when authoritiesUrl not present', function () {
        securityConfig.authoritiesUrl = null;
        $securityService.getRemoteAuthorities();

        expect($localStorage.authorities).toBeUndefined();
    });

    it('expects getAuthorities() to return the authorities from localStorage', function () {
        $localStorage.authorities = ['ADMIN'];

        var results = $securityService.getAuthorities();
        expect(results.length).toBe(1);
        expect(results[0]).toBe('ADMIN');
    });

    it('expects getAuthorities() to return empty array if it is null', function () {
        $localStorage.authorities = null;

        expect($securityService.getAuthorities().length).toBe(0);
    });

    it('expects hasPermission() to return true if user has the permission', function () {
        $localStorage.authorities = ['ADMIN'];

        expect($securityService.hasPermission('ADMIN')).toBeTruthy();
    });

    it('expects hasPermission() to return true if user has one of authorities provided', function () {
        $localStorage.authorities = ['ADMIN'];

        expect($securityService.hasPermission(['ADMIN', 'EMPLOYEE'])).toBeTruthy();
    });

    it('expects hasPermission() to return false if user does not have the permission', function () {
        $localStorage.authorities = ['EMPLOYEE'];

        expect($securityService.hasPermission('ADMIN')).toBeFalsy();
    });

    it('expects reset() to clear out any saved roles', function () {
        $localStorage.authorities = ['ADMIN'];

        $securityService.reset();

        expect($localStorage.authorities.length).toBe(0);
    });
});