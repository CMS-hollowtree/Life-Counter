angular.module('starter.controllers', ['ionic', 'firebase'])

.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout, onlineUsers, PeopleService) {
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
          userRef.child('lastSeen').set(null);
		      userRef.child('online').set(true);
          userRef.child('userName').set($rootScope.authData.google.displayName);
          userRef.child('imgURL').set($rootScope.authData.google.profileImageURL);
          userRef.child('uid').set($rootScope.authData.google.id);
          $scope.player = PeopleService.getPerson($rootScope.authData.google.id);
          $rootScope.online = true;

		  userRef.child('lastSeen').onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
		  userRef.child('online').onDisconnect().set(null);
        }
      });
    });
  $scope.closeLogin();
  };
  
  $scope.$on('$ionicView.enter', function(e) {
	if ($rootScope.online == true) {

	}else{
		$scope.login();
	}
});
})

.controller('RegsiterCtrl', function($rootScope, $scope, $timeout, onlineUsers, PeopleService){
   
})

.controller('PlayerCtrl', function($rootScope, $scope, onlineUsers, PeopleService, MatchService) {
   $scope.players = MatchService.getPeople($rootScope.currentMatchId);
   $scope.matchInfo = MatchService.getInfo($rootScope.currentMatchId);
   
   $scope.addLife = function() {
      MatchService.addLife();
    };
    $scope.subLife = function() {
      MatchService.subLife();
    };
})

.controller('MasterCtrl', function($scope, PeopleService, LoadingService){
  $scope.people = PeopleService.getPeople();

  $scope.showLoad = function() {
    LoadingService.loadShow();
  }
  $scope.hideLoad = function() {
    LoadingService.loadHide();
  }

  $scope.showLoad();

  $scope.people.$loaded()
    .then(function(){
      $scope.hideLoad();
    })
})

.controller('PlayerEditCtrl', function($rootScope, $scope, PeopleService){
  $scope.person = PeopleService.getPerson($rootScope.authData.google.id);
  $scope.newData = {};

  $scope.updateInfo = function(newData){
    PeopleService.updateInfo($rootScope.authData.google.id, newData);
  };
  
})

.controller('NewMatchCtrl', function($rootScope, $scope, $state, PeopleService, MatchService){
	$scope.newMatchInfo = {};
	
	$scope.joinMatch = function() {
		MatchService.joinMatch($rootScope.currentMatchId);
	}
	$scope.updateInfo = function(newMatchInfo) {
		MatchService.updateMatch($rootScope.currentMatchId, newMatchInfo);
		$scope.joinMatch();
	}
})

.controller('MatchCtrl', function($rootScope, $timeout, $state, $scope, $ionicLoading, PeopleService, MatchService, ionicMaterialInk, ionicMaterialMotion, LoadingService){
  $scope.matchIDs = MatchService.getMatches($rootScope.authData.google.id);
  $scope.matches = [];
  
  $scope.showLoad = function() {
    LoadingService.loadShow();
  }
  $scope.hideLoad = function() {
    LoadingService.loadHide();
  }
  $scope.joinMatch = function(matchID) {
	MatchService.joinMatch(matchID);
  }

  $scope.showLoad();

  $scope.matchIDs.$loaded()
    .then(function(){
        if ($scope.matchIDs.length < 1) {
          $scope.viewTitle = "No Matches";
        }else{
          $scope.viewTitle = "Matches";
        }
        angular.forEach($scope.matchIDs, function(match) {
            console.log(match.id);
            $scope.matches.push({
              id: match.id,
              data: MatchService.getPeople(match.id),
              info: MatchService.getInfo(match.id)
            });
        })
        $scope.hideLoad();
    });
})

.controller('PlayerDetailCtrl', function($rootScope, $state, $scope, $stateParams, PeopleService, MatchService){
  var personId = $stateParams.id;
  $scope.person = PeopleService.getPerson(personId);
	
  $scope.newMatch = function(matchPlayers) {
    MatchService.addMatch(personId, $scope.person.imgURL, $scope.person.userName);
    $state.go('app.newmatch');
  };
  
  
})

.controller('CardsCtrl', function($rootScope, $state, $scope, $stateParams, CardsService, LoadingService){
  $scope.cards = CardsService.getCards();
  
  $scope.showLoad = function() {
    LoadingService.loadShow();
  }
  $scope.hideLoad = function() {
    LoadingService.loadHide();
  }
  
  $scope.showLoad();
  
  $scope.cards.$loaded()
    .then(function(){
        $scope.hideLoad();
    });

})

.controller('DecksCtrl', function($rootScope, $state, $scope, $stateParams, CardsService, PeopleService, DeckService){
  $scope.decks = PeopleService.getDecks($rootScope.authData.google.id);
  //$scope.cards = [];
  //$scope.MTGcards = CardsService.getCards();
  
  
  //$scope.addCard=function(){
  //  $scope.cards.push({})
  //}
  $scope.goAddDeck = function(){
	  $state.go('app.adddeck')
  }
  $scope.addDeck = function(deck) {
	  DeckService.addDeck(deck);
  }
  
})

.factory('PeopleService', function($firebase, $rootScope){
  var ref = new Firebase('https://chat-test-28.firebaseio.com/');
  return {
    getPeople: function(){
      return $firebase(ref.child('presence')).$asArray();
    },
    getPerson: function(personId){
      return $firebase(ref.child('presence').child(personId)).$asObject();
    },
    updateInfo: function(personId, newData){
      return ref.child('presence').child(personId).update(newData);
    },
	  getDecks: function(personId) {
		  return $firebase(ref.child('presence').child(personId).child('decks')).$asArray();
	}
  }
})

.factory("onlineUsers", ['$firebase', "$rootScope", function($firebase, $rootScope){
     var ref = new Firebase("https://chat-test-28.firebaseio.com/presence");
     return $firebase(ref.limitToLast(10)).$asArray();
}])

.factory("DeckService", ['$firebase', "$rootScope", function($firebase, $rootScope){
    var ref = new Firebase('https://chat-test-28.firebaseio.com/');
		return {
			addDeck: function(deckData) {
				var newRef = ref.child('presence').child(personId).child('decks').push();
				return newRef.set(deckData);
			}
		}
}])

.factory("CardsService", ['$firebase', "$rootScope", function($firebase, $rootScope){
     return {
		 getCards: function() {
			 var ref = new Firebase("https://chat-test-28.firebaseio.com/MTGCards");
				return $firebase(ref).$asArray();
		 }
	 }
	 
}])

.factory("LoadingService", ['$firebase', "$rootScope", "$ionicLoading", function($firebase, $rootScope, $ionicLoading){
      return {
        loadShow: function(){
          $ionicLoading.show({
            content: '<i class="icon ion-load-c"></i>',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 50,
            showDelay: 0
          });
        },
        loadHide: function() {
          $ionicLoading.hide();
        }
      }
}])

.factory("MatchService", ['$firebase', "$rootScope", "$state", function($firebase, $rootScope, $state){
     var ref = new Firebase("https://chat-test-28.firebaseio.com/");
	return {
      getPeople: function(matchID){
       return $firebase(ref.child('matches').child(matchID).child('players')).$asArray();
      },
      getInfo: function(matchID){
       return $firebase(ref.child('matches').child(matchID).child('info')).$asObject();
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
          newRef.child('info').update({
            startedAt: Firebase.ServerValue.TIMESTAMP
          });
        $rootScope.currentMatchId = newRef.key();
        ref.child('presence').child($rootScope.authData.google.id).child('matchIDs').push({
			     id: $rootScope.currentMatchId
		});
        ref.child('presence').child(personId).child('matchIDs').push({
		         id: $rootScope.currentMatchId
		});
      return;
    },
	updateMatch: function(matchID, matchInfo) {
		return ref.child('matches').child(matchID).child('info').update(matchInfo);
	},
	joinMatch: function(matchID) {
      $rootScope.currentMatchId = matchID;
      $state.go('app.match');
	}
  }
}]);
