var app = angular.module('myConnects');

app.controller('AppCtrl', function($scope, $timeout, $mdBottomSheet, $mdDialog) {
    //------buttons----------
    $scope.title1 = 'Button';
    $scope.title4 = 'Warn';
    $scope.isDisabled = true;
    $scope.googleUrl = 'http://google.com';
    //----------------bottom bar--------------//
        $scope.alert = '';
        $scope.showGridBottomSheet = function($event) {
            $scope.alert = '';
            $mdBottomSheet.show({
                templateUrl: 'bottomGridTemplate.html',
                controller: 'AppCtrl',
                targetEvent: $event
            }).then(function(clickedItem) {
                    $scope.alert = clickedItem.name + ' clicked!';
                });
        };


        $scope.items = [
            { name: 'Hangout', icon: 'hangout' },
            { name: 'Mail', icon: 'mail' },
            { name: 'Message', icon: 'message' },
            { name: 'Copy', icon: 'copy' },
            { name: 'Facebook', icon: 'facebook' },
            { name: 'Twitter', icon: 'twitter' },
        ];
        $scope.listItemClick = function($index) {
            var clickedItem = $scope.items[$index];
            $mdBottomSheet.hide(clickedItem);
        };
//-----------------top toolBar--------
    app.directive('svgIcon', function() {
        return {
            restrict: 'E',
            replace: true,
            template: '<svg viewBox="0 0 24 24" style="pointer-events: none;"><g><g><rect fill="none" width="24" height="24"></rect><path d="M3,18h18v-2H3V18z M3,13h18v-2H3V13z M3,6v2h18V6H3z"></path></g></g></svg>'
        };
    });

    //----------------dialog
        $scope.showAdvanced = function(ev) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: "dialog1.html",
                targetEvent: ev,
            })
                .then(function(answer) {
                    $scope.alert = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.alert = 'You cancelled the dialog.';
                });
        };
    function DialogController($scope, $mdDialog) {
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };
    }
});

