/**
 * Created by aldrinh on 3/11/15.
 */
var app = angular.module('myConnects');

app.controller('mainController', function($scope, $firebaseObject,facebookService) {
    $scope.test = "test passed";

//-----------------------------------------------------------REFs----------------------------------------------

    //---------for security----------paste your own firebase link here

    var ref = new Firebase("https://myconnects.firebaseio.com/appData");




//-----------------------------------------------------3-WAY-DATA BINDING------------------------------------------------------------------------------
    $scope.data = $firebaseObject(ref);
//-------------------------------------------------FB LOGIN AND CREATE/UPDATE USER-------------------------------------------------------------------
    $scope.fbLogin = function(){
        ref.authWithOAuthPopup("facebook", function(error, authData) {
                //--------------LOG---------------
                if (error) {
                    console.log("Login Failed!", error);
                } else {
                    console.log("Authenticated successfully with payload:", authData);

                    //----------------add stuff here for binding and add to firebase------------------
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

                }
            }, {
                scope: "email,user_friends"
            }
        )
    };
//-------------------------------------------------------GET FRIENDS FUNCTION--------------------------------------------------------------------------
    $scope.getFriends = function(){
        facebookService.getFriendsData($scope.currentUserToken).then(function(response){

            //------------LOOP THROUGH FRIENDS AND OBTAIN JUST IDS--------
            var allFriends = [];
            var friendsData = response.data;
            console.log(response.data);
                for (var i = 0; i < friendsData.length; i++) {
                    allFriends.push(friendsData[i].id);
                }

                //--------CODE IF I WANT TO ADD TO FIREBASE---------
//                var friendsRef = new Firebase("https://myconnects.firebaseio.com/appData/users" + "/" + ($scope.currentUserId) + "/" + "friends");
//                friendsRef.update(allFriends);
                // put allFriends Array into scope
                $scope.allFriends = allFriends;
                console.log($scope.allFriends);


        });
    };

//---------------------------------------------------ADD SKILL TO CURRENT USER SKILLS----------------------------------------------------------------
          //---------------CODE TO ADD SKILLS AS AN OBJECT KEY AND CATEGORY AS VALUE----------------------
//          $scope.addSkill = function(skill, category){
//          var currentUserSkills = {};
//          currentUserSkills[(skill)] = category;

//        //--------------------------ADD/UPDATE NEW LOCATION FOR SKILLS------------------
//        var newSkillRef = new Firebase("https://myconnects.firebaseio.com/appData/users" + "/" + ($scope.currentUserId) + "/" + "skills");
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
            var newSkillRef = new Firebase(ref + "/users" + "/" + ($scope.currentUserId) + "/" + "skills");
            newSkillRef.update(currentUserSkills)
            console.log("added skill:" + currentUserSkills);



          };









//--------------------------------------------------------------END-------------------------------------------------------------------------------------
});
