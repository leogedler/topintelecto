
(function(){

	angular.module('ingtelekto', ['ngRoute', 'ui.bootstrap','ngSanitize' ,'angular-loading-bar', 'service.module', 'ngFlash', 'ngFileUpload',
		])


	// App Routes
	.config(function($routeProvider, $locationProvider) {

		// Use the HTML5 History API
	    $locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');
		
		$routeProvider
			.when('/', {
				templateUrl : 'app/home/home.html',
				controller  : 'MainController',
				controllerAs : 'mainCtrl'
			})

			.otherwise({
		        redirectTo: '/'
		    });
	})

	// Run
	.run(['$rootScope','$location', '$routeParams', function($rootScope, $location, $routeParams) {
	    $rootScope.$on('$routeChangeSuccess', function(e, current, pre) {
	    	// console.log('Current route name: ' + $location.path());

	    	// Tracking Current Location for Google Analytics 
	    	// ga('send', 'pageview', $location.path());

	    });
	}])


	// Main Controller
	.controller('MainController', ['$http','$location', '$routeParams', '$rootScope', '$scope', 'CurrentData', function($http, $location, $routeParams, $rootScope, $scope, CurrentData, algolia) {
		var mainCtrl = this;
		mainCtrl.logingUp = false;
		mainCtrl.searchResults = [];
		mainCtrl.noSearchResults = true;

		// Meta tags
		$rootScope.robot = mMainRobot;
		$rootScope.pageTitle = mMainTitle;
		$rootScope.pageDescription = mMainPageDescription;
		$rootScope.ogPageDescription = mMainOgPageDescription;
		$rootScope.ogPageImage = mMainOgPageImage;
		$rootScope.ogPageTitle = mMainOgPageTitle;
		$rootScope.url = $location.absUrl();
		$rootScope.twitterDescription = mMainTwitterDescription;
		$rootScope.twitterImage = mMainTwitterImage;



		if (mCurrentUser != null) {

			CurrentData.getCurrentUser().then(function(response){
				mainCtrl.user = response;

			});

		};


		this.isUser = function(){
			if (mCurrentUser != null) {
				return true;
			}else{
				return false;
			};
		};


		this.loging = function(){

			mainCtrl.logingUp = true;

			Parse.User.logIn(mainCtrl.loginForm.username.toLowerCase(), mainCtrl.loginForm.pass, {
			  success: function(user) {

			  	mCurrentUser = Parse.User.current();
			  	mainCtrl.logingUp = false;
			  	window.location.reload();
			  	
			  },
			  error: function(user, error) {
				// Hide loading
			  	$scope.$apply(function () {
            		mainCtrl.logingUp = false;
        		});
			  	
			    // The login failed. Check error to see why.
			    if (error.code == 101) {
			    	alert("Email o clave incorrecta, recuerda que la clave es sensible a las mayúsculas y minúsculas!!");
			    }else{
			    	alert("Error: " + error.code + " " + error.message);
			    };
			   
			  }
			});
		};



		this.logOut = function(){

			Parse.User.logOut();
			mCurrentUser = Parse.User.current();
			window.location.reload();

			// if ($location.path() == '/perfil') {

			// 	window.location.replace('http://sohamfit.com');
			// }else{
			// 	window.location.reload();

			// };
		};


		this.submitLead = function(source){

			mainCtrl.sendingLead = true;

			// Mix panel promo video play
			// mixpanel.track('Promo2 new lead');

			mainCtrl.lead.source = source;


			// Sending lead
			$http({
	    		method : 'POST', 
				headers: mPostPutHeaderJson,
				data: mainCtrl.lead,
	    		url : apiUrl+'/classes/Leads'

	    		}).success(function(response){

	    			mainCtrl.sendingLead = false;
	    			mainCtrl.leadSubmitted = true;
	    			mainCtrl.lead = {};


	    // 			// Send email to lead
					// $http({
			  //   		method : 'POST', 
					// 	headers: mPostPutHeaderJson,
					// 	data: prom2Ctrl.lead,
			  //   		url : apiUrl+'/functions/emailToLead'

			  //   		}).success(function(data){

			  //   			prom2Ctrl.sendingLead = false;
					// 		prom2Ctrl.leadSent = true;

			  //   		});	    			
	    		});
		};


		this.refreshUser = function(){
			CurrentData.getCurrentUser().then(function(response){
	    		mainCtrl.user = response;
	    	});
		};


		this.search = function(){

			$('#search-input-header').blur()	
			// console.log(mainCtrl.searchResults);
			$location.url('/busqueda?search='+mainCtrl.searchWords);

		};



	}])


})();