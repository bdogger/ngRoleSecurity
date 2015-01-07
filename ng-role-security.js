'use strict';

(function () {
    angular.module('ngRoleSecurity', ['ngRoute', 'ngStorage'])

        .constant('securityConfig', {
            authoritiesUrl: '',
            forbiddenRoute: ''
        })

        .factory('$securityService', function $securityService($localStorage, $http, securityConfig) {
            return {
                getRemoteAuthorities: function () {
                    return $http.get(securityConfig.authoritiesUrl)
                        .success(function (authorities) {
                            $localStorage.authorities = authorities;
                        });
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
                },
                reset: function () {
                    $localStorage.authorities = [];
                }
            };
        })

        .directive('requireRole', function ($securityService) {

            function applySecurity(element, attrs, $securityService) {
                var roles = attrs.requireRole;
                if ($securityService.hasPermission(roles.split(','))) {
                    element.removeClass('hidden');
                } else {
                    element.addClass('hidden');
                }
            }

            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    applySecurity(element, attrs, $securityService);
                    scope.$watch(function () {
                        return $securityService.getAuthorities();
                    }, applySecurity(element, attrs, $securityService));
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