/**
 * Created by aldrinh on 3/11/15.
 */
var app = angular.module('myConnects');

app.controller('mainController', function($scope, $firebaseObject,facebookService) {
    $scope.test = "test passed";

//-----------------------------------------------------------REFs----------------------------------------------

    var ref = new Firebase("https://myconnects.firebaseio.com/appData");
//    console.log(ref);
//-----------------------------------------------------3-WAY-DATA BINDING------------------------------------------------------------------------------
    $scope.data = $firebaseObject(ref);

//-------------------------------------------------------GET FRIENDS------------------------------------------------------------

    $scope.getFriends = function(){
        facebookService.getFriendsData($scope.currentUserToken).then(function(response){
            //------------LOOP THROUGH FRIENDS AND OBTAIN JUST IDS--------
            var allFriends = [];
            var friendsData = response.data;
            for (var i = 0; i < friendsData.length; i++) {


                //----------WHERE THE MAGIC IS.... GET ALL FRIENDS ID AND THEN GET DATA FROM ALL USERS, THEN PUSH OBJECT INTO AN ARRAY SO THAT IT CAN BE FILTERED ON THE VIEW
                var friendObject = {};
                friendObject = $scope.data.users[friendsData[i].id]; // how can i make this still in 3-way data binding???
                allFriends.push(friendObject);
            }
            $scope.allFriends = allFriends;
        });
    };
//-----------------------------------------on auth callback
    var onAuthCallback = function(authData) {
        if (authData) {
            console.log("Authenticated with uid:", authData);
            $scope.currentUserId = authData.facebook.id;
            $scope.currentUserToken = authData.facebook.accessToken;
            var currentUser = {
                name: authData.facebook.displayName,
                picUrl: authData.facebook.cachedUserProfile.picture.data.url,
                email: authData.facebook.email || "none",
                link: authData.facebook.cachedUserProfile.link,
                lastLogin: new Date()
            };
            //-------NEW REF FOR USERS----------PUT IN SCOPE SO THAT THE ADD SKILL CAN ADD FOLDER TO newUserRef-------
            $scope.usersRef = ref.child("users");
            $scope.newUserRef = new Firebase($scope.usersRef + "/" + $scope.currentUserId);
            $scope.newUserRef.update(currentUser);
            $scope.data.$loaded().then(function (data) {
                $scope.getFriends();
            });
        } else {
            console.log("Client unauthenticated.")
            window.location='/#/login';
        }
    };



//---------------------------------------------------------AUTO LOG IN----------------------------------------------------------

    ref.onAuth(onAuthCallback);

    //---------------------------------------------------ADD SKILL TO CURRENT USER SKILLS----------------------------------------------------------------
//          ---------------CODE TO ADD SKILLS AS AN OBJECT KEY AND CATEGORY AS VALUE----------------------
//          $scope.addSkill = function(skill, category){
//          var currentUserSkills = {};
//          currentUserSkills[(skill)] = category;
//
//        //--------------------------ADD/UPDATE NEW LOCATION FOR SKILLS------------------
//        var newSkillRef = new Firebase(ref + "/users" + "/" + ($scope.currentUserId) + "/" + "skills");
//        newSkillRef.update(currentUserSkills)
//        console.log("added skill:" + currentUserSkills);


    //---------------CODE TO ADD SKILLS AS AN ARRAY---------------------------------------------
    $scope.addSkill = function(skill){
        //---convert from $scope so that we can use .push() the new skill--------------
        var currentUserSkills = $scope.data.users[($scope.currentUserId)].skills || [];  //----[] is needed to create empty array if no skills yet
        //-----add skill to current Skills--------
        currentUserSkills.push(skill);
        //-----add skill to current Skills--------

        //--------------------------ADD/UPDATE NEW LOCATION FOR SKILLS------------------
        $scope.newSkillRef = new Firebase(ref + "/users" + "/" + ($scope.currentUserId) + "/" + "skills");
        $scope.newSkillRef.update(currentUserSkills);
        console.log("added skill:" + currentUserSkills);
        $scope.skillToAdd = "";

    };

    //-----------------
    $scope.removeSkill = function (skill){
        console.log(arguments);
        var currentUserSkills = $scope.data.users[($scope.currentUserId)].skills;
        var skillIndex = currentUserSkills.indexOf(skill);
        currentUserSkills.splice(skillIndex,1);
        console.log($scope.newSkillRef);
        $scope.newSkillRef = new Firebase(ref + "/users" + "/" + ($scope.currentUserId) + "/" + "skills");
        $scope.newSkillRef.set(currentUserSkills);
    };

//--------------------- CODE TO ADD NEEDS ----USE ANGULAR-FIRE THIS TIME-----------//





//-------------------------------------------------FB LOGIN AND CREATE/UPDATE USER-------------------------------------------------------------------

    $scope.fbLogin = function() {
// prefer pop-ups, so we don't navigate away from the page
        ref.authWithOAuthPopup("facebook", function(error, authData) {
            if (error) {
                if (error.code === "TRANSPORT_UNAVAILABLE") {
                    // fall-back to browser redirects, and pick up the session
                    // automatically when we come back to the origin page
                    ref.authWithOAuthRedirect("facebook", function(authData) {
                        alert("login popup failed");
                        console.log(authData);
                     /* ... */

                    });
                }
            } else if (authData) {
                // user authenticated with Firebase
                //----------------user id and token to be used in scope------------------
                console.log("authData", authData);
                $rootScope.currentUserId = authData.facebook.id;
                $scope.currentUserToken = authData.facebook.accessToken;
                var currentUser = {
                    name: authData.facebook.displayName,
                    picUrl: authData.facebook.cachedUserProfile.picture.data.url,
                    email: authData.facebook.email || "none",
                    link: authData.facebook.cachedUserProfile.link,
                    lastLogin: new Date()
                };
                //-------change view to main-------
                window.location='/#/main';
                //-------NEW REF FOR USERS----------PUT IN SCOPE SO THAT THE ADD SKILL CAN ADD FOLDER TO newUserRef-------
                $scope.usersRef = ref.child("users");
                $scope.newUserRef = new Firebase($scope.usersRef + "/" + $scope.currentUserId);
                $scope.newUserRef.update(currentUser);
                $scope.getFriends();
            }
        }, {
            remember: "default",
            scope: "email,user_friends"
        });
    };







//    $scope.fbLogin = function() {
//        ref.authWithOAuthPopup("facebook", function(error, authData) {
//                //--------------LOG---------------
//                if (error) {
//                    console.log("Login Failed!", error);
//                } else {
//                    console.log("Authenticated successfully with payload:", authData);
//
//                    //----------------user id and token to be used in scope------------------
//                    $rootScope.currentUserId = authData.facebook.id;
//                    $scope.currentUserToken = authData.facebook.accessToken;
//
//
//
//                    var currentUser = {
//                        name: authData.facebook.displayName,
//                        picUrl: authData.facebook.cachedUserProfile.picture.data.url,
//                        email: authData.facebook.email || "none",
//                        link: authData.facebook.cachedUserProfile.link,
//                        lastLogin: new Date()
//                    };
//
//                    //-------NEW REF FOR USERS----------PUT IN SCOPE SO THAT THE ADD SKILL CAN ADD FOLDER TO newUserRef-------
//                    $scope.usersRef = ref.child("users");
//                    $scope.newUserRef = new Firebase($scope.usersRef + "/" + $scope.currentUserId);
//                    $scope.newUserRef.update(currentUser);
//                    $scope.getFriends();
//
//
//                }
//            }, {
//                remember: "default",
//                scope: "email,user_friends"
//            }
//        );
//    };

$scope.logOut = function() {
    ref.unauth();
    window.location.reload();
};



//----------------------------AUTO RUN-------------------------
//    $scope.onAuth();
//    console.log()
//    $scope.getFriends();
//    $scope.fbLogin();
//    $scope.fbRedLogin();
//--------------------------------------------------------------END-------------------------------------------------------------------------------------


});