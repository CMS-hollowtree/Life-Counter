angular.module('starter.controllers', ['ionic', 'firebase'])

.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout, onlineUsers) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
      //Set messages to chatMessages factory which returns the firebase data
    $scope.users = onlineUsers;
    
    //Initialize message object
    $scope.user = {};

    var ref = new Firebase('https://chat-test-28.firebaseio.com/');
    ref.authWithOAuthPopup('google', function(error, authData) {
      var authData = ref.getAuth();
      if(error){
        alert('error');
      }
      else {
        alert('success');
        
      }
      $rootScope.authData = authData;
      console.log(authData);

      var amOnline = new Firebase('https://chat-test-28.firebaseio.com/.info/connected');

      var userRef = new Firebase('https://chat-test-28.firebaseio.com/presence/' + $rootScope.authData.google.id);
      amOnline.on('value', function(snapshot) {
  if (snapshot.val()) {
    userRef.child('onlineStatus').onDisconnect().set('☆ offline');
    userRef.child('onlineStatus').set('☆ online');
    userRef.child('currentLife').set(20);
    userRef.child('userName').set($rootScope.authData.google.displayName);
    userRef.child('imgURL').set($rootScope.authData.google.profileImageURL);

    }
  });
    
  });


  $scope.closeLogin();

  };
})

.controller('LifeCtrl', ["$rootScope", "$scope", "onlineUsers", function($rootScope, $scope, onlineUsers) {
   //Set messages to chatMessages factory which returns the firebase data
    $scope.users = onlineUsers;
    
    //Initialize message object
    $scope.user = {};

  $scope.addLife = function() {
        var userRef = new Firebase('https://chat-test-28.firebaseio.com/presence/' + $rootScope.authData.google.id);
      userRef.child('currentLife').transaction(function(currentLife) {
        return currentLife+1;
      })
      };
      $scope.subLife = function() {
        var userRef = new Firebase('https://chat-test-28.firebaseio.com/presence/' + $rootScope.authData.google.id);
      userRef.child('currentLife').transaction(function(currentLife) {
        return currentLife-1;
      })
      };
}])

.controller('PlayerCtrl', ["$rootScope", "$scope", "onlineUsers", function($rootScope, $scope, onlineUsers) {
  $scope.players = onlineUsers;
   $scope.matchPlayers = [];
  $scope.match = {};
  $scope.newMatch = function(matchPlayers) {
    var ref = new Firebase("https://chat-test-28.firebaseio.com/matches");
    ref.push({ matchPlayers });


  };
}])

.controller('MatchCtrl', ["$rootScope", "$scope", "onlineUsers", function($rootScope, $scope, onlineUsers) {
 
}])

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})


.factory("onlineUsers", ['$firebase', "$rootScope", function($firebase, $rootScope){
     // create a reference to the Firebase where we will store our data
     var ref = new Firebase("https://chat-test-28.firebaseio.com/presence");
 
     // this uses AngularFire to create the synchronized array
     return $firebase(ref.limitToLast(10)).$asArray();
}]);

