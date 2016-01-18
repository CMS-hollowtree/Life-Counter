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
        //alert('success');
        
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
    userRef.child('uid').set($rootScope.authData.google.id);

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

.controller('PlayerCtrl', function($rootScope, $scope, onlineUsers, PeopleService, MatchService) {
    $scope.players = MatchService.getPeople();

   $scope.addLife = function() {
        var userRef = new Firebase('https://chat-test-28.firebaseio.com/matches/' + $rootScope.currentMatchId);
      userRef.child($rootScope.authData.google.id).transaction(function(currentLife) {
        return currentLife+1;
      })
      };
      $scope.subLife = function() {
        var userRef = new Firebase('https://chat-test-28.firebaseio.com/matches/' + $rootScope.currentMatchId);
      userRef.child($rootScope.authData.google.id).transaction(function(currentLife) {
        return currentLife-1;
      })
      };
})


.controller('MasterCtrl', function($scope, PeopleService){
  $scope.people = PeopleService.getPeople();
})

.controller('MatchCtrl', function($scope, PeopleService){
  
})
 
.controller('PlayerDetailCtrl', function($rootScope, $state, $scope, $stateParams, PeopleService, MatchService){
  var personId = $stateParams.id;
  $scope.person = PeopleService.getPerson(personId);

  
    $scope.newMatch = function(matchPlayers) {
      $scope.matchPlayers = [];
  
      var ref = new Firebase("https://chat-test-28.firebaseio.com/matches");
      var newRef = ref.push();
        newRef.child($rootScope.authData.google.id).set(20);
        newRef.child(personId).set(20);
      $rootScope.currentMatchId = newRef.key();
      console.log($rootScope.currentMatchId);
      $state.go('app.match'); 

  };
})

.factory('PeopleService', function($firebase, $rootScope){
 
  var ref = new Firebase('https://chat-test-28.firebaseio.com/presence');
 
  return {
    getPeople: function(){ 
      return $firebase(ref).$asArray();
    },
    getPerson: function(personId){
    return $firebase(ref.child(personId)).$asObject();
   console.log(personId);
    }
  }  
})

.factory("onlineUsers", ['$firebase', "$rootScope", function($firebase, $rootScope){
     // create a reference to the Firebase where we will store our data
     var ref = new Firebase("https://chat-test-28.firebaseio.com/presence");
 
     // this uses AngularFire to create the synchronized array
     return $firebase(ref.limitToLast(10)).$asArray();
}])


.factory("MatchService", ['$firebase', "$rootScope", function($firebase, $rootScope){
     // create a reference to the Firebase where we will store our data
     var ref = new Firebase("https://chat-test-28.firebaseio.com/matches");
    return {
      getPeople: function(){ 
       return $firebase(ref.child($rootScope.currentMatchId)).$asArray();
      },
      getPerson: function(personId){
       // return $firebase(ref.child(personId)).$asObject();
     // console.log(personId);
    }
  }  

}]);
