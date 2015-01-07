ngRoleSecurity
==============

Angular services and directives for role based security.  This module does not handle authentication, it only handles permission once your user has logged in.  This design decision allows this module to be used with any type of authentication.

Once your user is authenticated/logged in, you can use this module to protect angular route URLS and to also hide UI elements.

##Installation##

To install this component into your project

    bower install ng-role-security

To save it as a bower dependency

    bower install ng-role-security --save

##General Usage##
Add ngRoleSecurity as a dependency to your angular app

   angular.module('yourAngularModule',  ['ngOAuth2Utils'])

Configure the securityConfig object in a config block

    angular.module('yourAngularModule',  ['ngOAuth2Utils'])
        .config(function(securityConfig) {
            securityConfig.authoritiesUrl = 'http://www.mywebsite/me/authorities';
            securityConfig.forbiddenRoute = '/access-denied';
        });

##Configuration Values##
*authoritiesUrl:* the url that will return an array of role names
*forbiddenRoute:* the angular route that the user will be taken to if they try to access a route without the proper authority

#Initializing Authorities#
Once your user has logged in, use the $securityService to load the user's roles.

    $securityService.getRemoteAuthorities();

There is a watch in the requireRole directive which will automatically hide or display UI elements when the authorities have been retrieved.

#Securing Routes#
If you want to secure a route, add the following access restrictions:

    .config(function ($routeProvider) {
        $routeProvider
        .when('/secured-admin', {
            template: '<div>Admins Only</div>',
            allowedRoles: ['ADMIN']
        })
        .when('/access-denied', {
            template: '<div>You do not have permission to view this</div>'
        })
        .when('/unsecured', {
            template: '<div>no security</div>'
        });
    })

You do not need to secure all routes, as you can see above.

If a user does not have the required role, then he or she will be redirected to the specified 403 route (securityConfig.forbiddenRoute).

Currently, the module is configured so that the user the user will have access if he or she has any of the allowedRoles.

#Securing UI elements#
You can hide elements by using the require-role directive

    <div require-role='ADMIN'>Admins only</div>
    <div require-role='ADMIN,EMPLOYEE'>Admins or Employees</div>

The UI element will be hidden unless the user has one of the roles specified

#Logging out#
To clear the roles, reset the roles upon logout.

    $securityService.reset();