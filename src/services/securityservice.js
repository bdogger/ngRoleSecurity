'use strict';

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