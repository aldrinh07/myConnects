/**
 * Created by aldrinh on 3/11/15.
 */
var app = angular.module('myConnects');

app.controller('mainController', function($scope, $firebaseObject,facebookService, $firebaseArray) {
    $scope.test = "test passed";


//-----------------------------------------------------------Firebase----------------------------------------------

    var ref = new Firebase("https://myconnects.firebaseio.com/appData");
//    console.log(ref);

//    var obj = $firebaseObject(ref);
//    $scope.data = obj;

//-------------------------------------------------firebase----3-WAY-DATA BINDING------------------------------------------------------------------------------
//    obj.$bindTo($scope, "data");
    $scope.data = $firebaseObject(ref);

//------------getCoverPhoto-------------;
    $scope.getCover = function() {
        facebookService.getCover($scope.currentUserToken).then(function(response){
            console.log("mainController response", response);
            var addCoverRef = new Firebase($scope.usersRef + "/" + $scope.currentUserId + "/" + "cover");

            if (response.cover){
                addCoverRef.set((response.cover.source));
            } else {
                var stockCover = "http://publicdomainarchive.com/wp-content/uploads/2014/12/public-domain-images-free-stock-photos-high-quality-resolution-downloads-public-domain-archive-3-1000x750.jpg"
                addCoverRef.set(stockCover);
//                    console.log("no cover for", friendsData[i].name)
            }
            $scope.data.$loaded().then(function () {
                $scope.getFriends();
            });
        });
        };
//-------------------------------------------------------GET FRIENDS------------------------------------------------------------

    $scope.getFriends = function(){
        facebookService.getFriendsData($scope.currentUserToken).then(function(response){
            //------------LOOP THROUGH FRIENDS AND OBTAIN JUST IDS--------
//            console.log(response);
            var allFriends = [];
            var friendsData = response.data;
//            console.log(friendsData);
            $scope.data.users[($scope.currentUserId)].friendCount = response.data.length;
//              console.log($scope.data.users[($scope.currentUserId)].friendCount);
//            console.log(response.data);



            for (var i = 0; i < friendsData.length; i++) {
//                $scope.newCoverRef = new Firebase($scope.usersRef + "/" + $scope.currentUserId);

//                var coverRef= $scope..child("cover");
//                addCoverRef= $scope.newUserRef.
//                var addCoverRef = new Firebase(ref + "users" + [friendsData[i].id] + "/" + "cover");
//                console.log(friendsData[i].cover.source);
//                debugger;
                console.log(friendsData[i].name,friendsData[i].id);
                var addCoverRef = new Firebase($scope.usersRef + "/" + friendsData[i].id + "/" + "cover");
                var addPicRef = new Firebase($scope.usersRef + "/" + friendsData[i].id + "/" + "picUrl");
                addPicRef.set("http://graph.facebook.com/" +friendsData[i].id+ "/picture?type=large");
                if (friendsData[i].cover){
                    addCoverRef.set((friendsData[i].cover.source));
                } else {
                    var stockCover = "http://publicdomainarchive.com/wp-content/uploads/2014/12/public-domain-images-free-stock-photos-high-quality-resolution-downloads-public-domain-archive-3-1000x750.jpg"
                    addCoverRef.set(stockCover);
//                    console.log("no cover for", friendsData[i].name)
                }
                //----------WHERE THE MAGIC IS.... GET ALL FRIENDS ID AND THEN GET DATA FROM ALL USERS, THEN PUSH OBJECT INTO AN ARRAY SO THAT IT CAN BE FILTERED ON THE VIEW
                var friendIdObject = {};
                friendIdObject = $scope.data.users[friendsData[i].id]; // how can i make this still in 3-way data binding???
//                console.log(friendIdObject);
                allFriends.push(friendIdObject);
            }
//            console.log($scope.currentUserId);
            $scope.data.$loaded().then(function () {
//                console.log($scope.currentUser);
                $scope.currentUser.skills= $scope.data.users[($scope.currentUserId)].skills;
                $scope.currentUser.needs= $scope.data.users[($scope.currentUserId)].needs;
                $scope.currentUser.friendCount= $scope.data.users[($scope.currentUserId)].friendCount;

//                console.log("all friends", allFriends);
                allFriends.unshift($scope.data.users[$scope.currentUserId]);
                $scope.allFriends = allFriends;
//                console.log("all friends", allFriends);
            });

        });
    };
//-----------------------------------------on auth callback
    var onAuthCallback = function(authData) {
        if (authData) {
//            console.log("Authenticated with uid:", authData);
            $scope.currentUserId = authData.facebook.id;
            $scope.currentUserToken = authData.facebook.accessToken;
            $scope.currentUser = {
                id: authData.facebook.id,
                name: authData.facebook.displayName,
                picUrl: authData.facebook.cachedUserProfile.picture.data.url,
                email: authData.facebook.email || "none",
                link: authData.facebook.cachedUserProfile.link,
                lastLogin: new Date()
            };
            //-------NEW REF FOR USERS----------PUT IN SCOPE SO THAT THE ADD SKILL CAN ADD FOLDER TO newUserRef-------
            $scope.usersRef = ref.child("users");
            $scope.newUserRef = new Firebase($scope.usersRef + "/" + $scope.currentUserId);
            $scope.newUserRef.update($scope.currentUser);
            $scope.data.$loaded().then(function () {
                $scope.getCover();
                $scope.getFriends();
                window.location='/#/main';

            });
        } else {
//            console.log("Client unauthenticated.")
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


    //---------------CODE TO ADD SKILLS AS AN ARRAY-----prevents duplicates----------------------------------------
    $scope.addSkill = function(skill){
        var updateSkills = function(){
            var newSkillRef = new Firebase(ref + "/users" + "/" + ($scope.currentUserId) + "/" + "skills");
            newSkillRef.update(currentUserSkills);
        };
        var setSkills = function(){
            var newSkillRef = new Firebase(ref + "/users" + "/" + ($scope.currentUserId) + "/" + "skills");
            newSkillRef.set(currentUserSkills);
        };
        var userSkills = $scope.data.users[($scope.currentUserId)].skills || [];  //----[] is needed to create empty array if no skills yet
        var currentUserSkills = userSkills.splice(0, userSkills.length);
            if (!currentUserSkills[0]) {
                currentUserSkills.push(skill);
                updateSkills();
            } else {
                  var index = currentUserSkills.indexOf(skill);
                     if (index === -1){
                         currentUserSkills.push(skill);
                         updateSkills();
                         $scope.data.$loaded().then(function () {
                             $scope.getFriends();
                         });
                     } else {
                         for (var i = 0;i < currentUserSkills.length; i++) {
                             userSkills.push(currentUserSkills[i]);
                         }
                         setSkills();
                         $scope.data.$loaded().then(function () {
                             $scope.getFriends();
                         });
                         return;
                     }
            }
//        console.log("skillToAdd",$scope.skill);
//        $scope.$scope.skill = "";
    };

    //-----------------
    $scope.removeSkill = function (skill){
//        console.log(arguments);
        var currentUserSkills = $scope.data.users[($scope.currentUserId)].skills;
        var skillIndex = currentUserSkills.indexOf(skill);
//        console.log("old",currentUserSkills);
        currentUserSkills.splice(skillIndex,1);
        var newSkillRef = new Firebase(ref + "/users" + "/" + ($scope.currentUserId) + "/" + "skills");
        newSkillRef.set(currentUserSkills);
//        console.log("new",currentUserSkills);
        $scope.data.$loaded().then(function () {
            $scope.getFriends();
        });
    };

    $scope.skillClick = function (name, id, skill){
        var currentUserSkills = $scope.data.users[($scope.currentUserId)].skills;
        var skillIndex = currentUserSkills.indexOf(skill);
//        console.log(arguments);
        if (skillIndex !== -1){
            alert("you clicked your own skill =" + (skill));
    } else {
            alert("you clicked" + " " + (name) + "s" + " " + "skill =" + (skill));
        }
    };
//--------------------- CODE TO ADD NEEDS ----USE ANGULAR-FIRE THIS TIME-----------//
    $scope.addNeed = function (need){
        var updateNeeds = function(){
            var newNeedRef = new Firebase(ref + "/users" + "/" + ($scope.currentUserId)+ "/" + "needs");
            newNeedRef.update(currentUserNeeds);
        };
        var setNeeds = function(){
            var newNeedRef = new Firebase(ref + "/users" + "/" + ($scope.currentUserId)+ "/" + "needs");
            newNeedRef.set(currentUserNeeds);
        };
        var userNeeds = $scope.data.users[($scope.currentUserId)].needs || [];
        var currentUserNeeds = userNeeds.splice(0, userNeeds.length);
            if (!currentUserNeeds[0]) {
                currentUserNeeds.push(need);
                updateNeeds();
                $scope.data.$loaded().then(function () {
                    $scope.getFriends();
                });
            } else {
                var index = currentUserNeeds.indexOf(need);
                    if (index === -1){
                        currentUserNeeds.push(need);
                        updateNeeds();
                        $scope.data.$loaded().then(function () {
                            $scope.getFriends();
                        });
                    } else {
                        for (var i = 0; i < currentUserNeeds.length; i++) {
                            userNeeds.push(currentUserNeeds[i]);
                        }
                        setNeeds();
                        $scope.data.$loaded().then(function () {
                            $scope.getFriends();
                        });
                        return;
                    }
            }
//        console.log($scope.needToAdd);
        $scope.needToAdd = "";
    };

    $scope.removeNeed = function (need){
        var currentUserNeeds = $scope.data.users[($scope.currentUserId)].needs;
        var needIndex = currentUserNeeds.indexOf(need);
//        console.log("old", currentUserNeeds);
        currentUserNeeds.splice(needIndex,1);
        var newNeedRef = new Firebase(ref + "/users" + "/" + ($scope.currentUserId)+ "/" + "needs");
        newNeedRef.set(currentUserNeeds);
//        console.log("new",currentUserNeeds);
    };


//-------------------------------------------------FB LOGIN AND CREATE/UPDATE USER-------------------------------------------------------------------

    $scope.fbLogin = function() {
// prefer pop-ups, so we don't navigate away from the page
        ref.authWithOAuthPopup("facebook", function(error) {
            if (error) {
                if (error.code === "TRANSPORT_UNAVAILABLE") {
                    // fall-back to browser redirects, and pick up the session
                    // automatically when we come back to the origin page
                    ref.authWithOAuthRedirect("facebook", function() {
                        alert("login popup failed");
                     /* ... */

                    });
                }
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

//$scope.skillsIndex = function() {
////    console.log($scope.data.sIndex);
//    $scope.data.selectedIndex = 0;
//};
//$scope.needsIndex = function() {
////    $scope.data.selectedIndex = 1;
//};
//
//$scope.consoleFriend = function() {
////    console.log($scope.allFriends);
//};

//----------------------------AUTO RUN-------------------------
//    $scope.onAuth();
//    console.log()
//    $scope.getFriends();
//    $scope.fbLogin();
//    $scope.fbRedLogin();
//--------------------------------------------------------------END-------------------------------------------------------------------------------------


});