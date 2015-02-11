'use strict';

(function () {
    angular.module('ngRoleSecurity', ['ngRoute', 'ngStorage'])

        .constant('securityConfig', {
            authoritiesUrl: '',
            forbiddenRoute: '',
            authorities: []
        })

        .factory('$securityService', function $securityService($localStorage, $http, securityConfig) {
            return {
                getRemoteAuthorities: function (callBackFunction) {
                    return $http.get(securityConfig.authoritiesUrl)
                        .success(function (authorities) {
                            $localStorage.authorities = authorities;
                            securityConfig.authorities = authorities;
                            if (callBackFunction) {
                                callBackFunction();
                            }
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

        .directive('requireRole', function ($securityService, securityConfig) {

            function applySecurity(element, attrs) {
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
                    applySecurity(element, attrs);
                    scope.$watch(function () {
                        return securityConfig.authorities;
                    }, function () {
                        applySecurity(element, attrs);
                    });
                }
            };
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
})();
