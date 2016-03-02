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
    var $securityService, $httpBackend, $sessionStorage, $location, securityConfig;

    beforeEach(inject(function (_$httpBackend_, _$location_, _$sessionStorage_, _$securityService_, _securityConfig_) {
        $httpBackend = _$httpBackend_;
        $securityService = _$securityService_;
        $sessionStorage = _$sessionStorage_;
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

        expect($sessionStorage.authorities[0]).toBe('EMPLOYEE');
        expect($sessionStorage.authorities[1]).toBe('MANAGER');
    });

    it('expects getRemoteAuthorities() to do nothing when authoritiesUrl not present', function () {
        securityConfig.authoritiesUrl = null;
        $securityService.getRemoteAuthorities();

        expect($sessionStorage.authorities).toBeNull();
    });

    it('expects getAuthorities() to return the authorities from localStorage', function () {
        $sessionStorage.authorities = ['ADMIN'];

        var results = $securityService.getAuthorities();
        expect(results.length).toBe(1);
        expect(results[0]).toBe('ADMIN');
    });

    it('expects getAuthorities() to return empty array if it is null', function () {
        $sessionStorage.authorities = null;

        expect($securityService.getAuthorities().length).toBe(0);
    });

    it('expects hasPermission() to return true if user has the permission', function () {
        $sessionStorage.authorities = ['ADMIN'];

        expect($securityService.hasPermission('ADMIN')).toBeTruthy();
    });

    it('expects hasPermission() to return true if user has one of authorities provided', function () {
        $sessionStorage.authorities = ['ADMIN'];

        expect($securityService.hasPermission(['ADMIN', 'EMPLOYEE'])).toBeTruthy();
    });

    it('expects hasPermission() to return false if user does not have the permission', function () {
        $sessionStorage.authorities = ['EMPLOYEE'];

        expect($securityService.hasPermission('ADMIN')).toBeFalsy();
    });

    it('expects reset() to clear out any saved roles', function () {
        $sessionStorage.authorities = ['ADMIN'];

        $securityService.reset();

        expect($sessionStorage.authorities.length).toBe(0);
    });
});