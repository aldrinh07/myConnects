/**
 * Created by aldrinh on 3/14/15.
 */
var app = angular.module('myConnects');

app.service('facebookService', function($http){

    this.getFriendsData = function(accessToken){
        console.log("getFriends initiated from service");
        return $http({
            method: 'GET',
            url: "https://graph.facebook.com/v2.2/me/friends?access_token="+accessToken+"&fields=id%2Cname%2Ccover&format=json&method=get&pretty=0&suppress_http_code=1"
        }).then(function(response){
                return (response.data)
            })
    };

    this.getCover = function(accessToken){
        console.log("getCover initiated from service");
        return $http({
            method: 'GET',
            url: "https://graph.facebook.com/v2.2/me?access_token="+accessToken+"&fields=cover&format=json&method=get&pretty=0&suppress_http_code=1"
        }).then(function(response) {
//                console.log("FB Service response",response.data);
                return (response.data)
            })
    };


});


