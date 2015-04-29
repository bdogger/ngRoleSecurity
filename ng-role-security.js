'use strict';

 (function(){

// Source: src/app.js
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
// Source: src/directives/requirerole.js
angular.module('ngRoleSecurity')
    .directive('requireRole', function ($securityService, securityConfig) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          scope.$watch(function () {
            return securityConfig.authorities;
          }, function () {
            var roles = attrs.requireRole;
            if ($securityService.hasPermission(roles.split(','))) {
              element.removeClass('hidden');
            } else {
              element.addClass('hidden');
            }
          });
        }
      };
    });
// Source: src/services/securityservice.js
angular.module('ngRoleSecurity')
    .factory('$securityService', function $securityService($sessionStorage, $localStorage, $http, securityConfig) {

      function getStorage() {
        return securityConfig.storageType === 'local' ? $localStorage : $sessionStorage;
      }

      return {
        getRemoteAuthorities: function (callBackFunction) {
          return $http.get(securityConfig.authoritiesUrl)
              .success(function (authorities) {
                getStorage().authorities = authorities;
                securityConfig.authorities = authorities;
                if (callBackFunction) {
                  callBackFunction();
                }
              });
        },
        getAuthorities: function () {
          var authorities = [];
          if (typeof  getStorage().authorities !== 'undefined' && getStorage().authorities != null) {
            authorities = getStorage().authorities;
          }

          return authorities;
        },
        hasPermission: function (requiredAuthorities) {
          if (!angular.isArray(requiredAuthorities)) {
            requiredAuthorities = [requiredAuthorities];
          }
          var userAuthorities = this.getAuthorities();
          var permission = false;

          angular.forEach(requiredAuthorities, function (requiredAuthority) {
            angular.forEach(userAuthorities, function (userAuthority) {
              if (userAuthority === requiredAuthority) {
                permission = true;
              }
            });
          });

          return permission;
        },
        reset: function () {
          getStorage().authorities = [];
        }
      };
    });
})();