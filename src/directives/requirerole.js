'use strict';

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