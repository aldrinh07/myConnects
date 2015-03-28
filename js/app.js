/**
 * Created by aldrinh on 3/11/15.
 */
var app = angular.module('myConnects', ["firebase", "ngRoute", 'ngMaterial']);

app.config(function($routeProvider){

    $routeProvider
        .when('/login', {
            templateUrl: "/view/loginView.html"
        })
        .when('/main', {
            templateUrl: "/view/main.html"
        })
        .otherwise( {
            redirectTo: '/login'
        })

});