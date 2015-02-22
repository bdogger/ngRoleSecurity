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
          if (!$securityService.hasPermission(next.requiredRole)) {
            event.preventDefault();
            $location.path(securityConfig.forbiddenRoute);
          }
          else {
            $location.path(next.originalPath);
          }
        }
      });
    });