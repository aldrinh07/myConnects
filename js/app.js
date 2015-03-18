/**
 * Created by aldrinh on 3/11/15.
 */
var app = angular.module('myConnects', ["firebase", "ngRoute"]);

app.config(function($routeProvider){

    $routeProvider
        .when('/login', {
            templateUrl: "./login/loginView.html"
        })
        .otherwise( {
            redirectTo: '/login'
        })

});