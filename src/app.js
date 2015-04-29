'use strict';

angular.module('ngRoleSecurity', ['ngRoute', 'ngStorage'])

    .constant('securityConfig', {
        authoritiesUrl: '',
        forbiddenRoute: '',
        authorities: [],
        storageType: 'session'
    })

    .run(function ($location, $rootScope, $securityService, securityConfig) {
        securityConfig.authorities = $securityService.getAuthorities();
        $rootScope.$on('$routeChangeStart', function (event, next) {
            if (typeof  next.requiredRole !== 'undefined') {
                var path = $securityService.hasPermission(next.requiredRole) ? next.originalPath : securityConfig.forbiddenRoute;

                $rootScope.$evalAsync(function () {
                    $location.path(path);
                });
            }
        });
    });