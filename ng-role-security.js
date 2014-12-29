'use strict';

(function () {
    angular.module('ngRoleSecurity', ['ngRoute', 'ngStorage'])

        .factory('$securityService', function $securityService($localStorage, $http, securityConfig) {
            return {
                getRemoteAuthorities: function () {
                    if (typeof securityConfig.authoritiesUrl !== 'undefined' && securityConfig.authoritiesUrl != null) {
                        return $http.get(securityConfig.authoritiesUrl)
                            .success(function (authorities) {
                                $localStorage.authorities = authorities;
                            });
                    }
                },
                getAuthorities: function () {
                    var authorities = [];
                    if (typeof  $localStorage.authorities !== 'undefined' && $localStorage.authorities != null) {
                        authorities = $localStorage.authorities;
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
                }
            };
        })

        .directive('requireRole', function ($securityService) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var roles = attrs.requireRole;
                    if (!$securityService.hasPermission(roles.split(','))) {
                        element.addClass('hidden');
                    }
                }
            };
        })

        .run(function ($location, $rootScope, $securityService, securityConfig) {
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
})();