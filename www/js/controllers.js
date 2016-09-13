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
    $scope.users = onlineUsers;
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

.controller('PlayerCtrl', function($rootScope, $scope, onlineUsers, PeopleService, MatchService) {
   $scope.players = MatchService.getPeople($rootScope.currentMatchId);

   $scope.addLife = function() {
      MatchService.addLife();
    };
    $scope.subLife = function() {
      MatchService.subLife();
    };
})

.controller('MasterCtrl', function($scope, PeopleService){
  $scope.people = PeopleService.getPeople();
})

.controller('MatchCtrl', function($rootScope, $scope, PeopleService, MatchService){
  $scope.matches = MatchService.getMatches($rootScope.authData.google.id);
  for (m in $scope.matches){
	console.log(m);  
  };
	//console.log($scope.matches);
})

.controller('PlayerDetailCtrl', function($rootScope, $state, $scope, $stateParams, PeopleService, MatchService){
  var personId = $stateParams.id;
  $scope.person = PeopleService.getPerson(personId);
  
  $scope.newMatch = function(matchPlayers) {
	MatchService.addMatch(personId, $scope.person.imgURL, $scope.person.userName);
  
  $state.go('app.match');
  };
})

.factory('PeopleService', function($firebase, $rootScope){
  var ref = new Firebase('https://chat-test-28.firebaseio.com/');
  return {
    getPeople: function(){
      return $firebase(ref.child('presence')).$asArray();
    },
    getPerson: function(personId){
      return $firebase(ref.child('presence').child(personId)).$asObject();
    }
  }
})

.factory("onlineUsers", ['$firebase', "$rootScope", function($firebase, $rootScope){
     var ref = new Firebase("https://chat-test-28.firebaseio.com/presence");
     return $firebase(ref.limitToLast(10)).$asArray();
}])

.factory("MatchService", ['$firebase', "$rootScope", function($firebase, $rootScope){
     var ref = new Firebase("https://chat-test-28.firebaseio.com/");
    return {
      getPeople: function(matchID){
       return $firebase(ref.child('matches').child(matchID).child('players')).$asArray();
      },
      getMatches: function(uid){
        return $firebase(ref.child('presence').child(uid).child('matchIDs')).$asArray();
      },
      addLife: function(){
        ref.child('matches').child($rootScope.currentMatchId).child('players').child($rootScope.authData.google.id).child('currentLife').transaction(function(currentLife) {
          return currentLife+1;
        })
      },
      subLife: function(){
        ref.child('matches').child($rootScope.currentMatchId).child('players').child($rootScope.authData.google.id).child('currentLife').transaction(function(currentLife) {
          return currentLife-1;
        })
      },
      addMatch: function(personId, pimgURL, puserName){
        var newRef = ref.child('matches').push();
          newRef.child('players').child($rootScope.authData.google.id).set({
            uid: $rootScope.authData.google.id,
            imgURL: $rootScope.authData.google.profileImageURL,
            userName: $rootScope.authData.google.displayName,
            currentLife: 20
          });
          newRef.child('players').child(personId).set({
            uid: personId,
            imgURL: pimgURL,
            userName: puserName,
            currentLife: 20
          });
        $rootScope.currentMatchId = newRef.key();
        ref.child('presence').child($rootScope.authData.google.id).child('matchIDs').push({
			id: $rootScope.currentMatchId
		});
        ref.child('presence').child(personId).child('matchIDs').push({
			id: $rootScope.currentMatchId
		});
      return;
    }
  }
}]);
