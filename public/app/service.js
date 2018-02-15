'use strict';

angular.module('service.module', [])


/* Factories */

// Current data factory
.factory("CurrentData", ['$http', '$q', function($http, $q){

	var user = null;
	var fetchingUser = false;
	var defer = $q.defer();

	return {

		clearCurrentUser: function(){
			user = null;
			defer = null;
			defer = $q.defer();
		},

		saveCartItems: function(items){
			user.cart = items;
		},

		getCurrentUser: function(){
			if (!fetchingUser) {
				if (user) {
					defer.resolve(user);
				}else{

					fetchingUser = true;
					$http(
	    				{
			    		method : 'GET', 
		    			headers: mGetHeaderJson,
		    			params: {
								'include':'wishes.images,cart'
						},
		    			url : apiUrl+'/users/'+mCurrentUser.id
			    		}).success(function(data){
			    			user = data;
			    			fetchingUser = false;
			    			defer.resolve(data);
			    		});
			 	};	
		 	};

		 	return defer.promise; 	
		},

		getSearch: function(words, category){

			return $http(
				{
				method: 'POST',
				headers: mPostPutHeaderJson,
				data: {
					'words': words,
					'searchFor': category
				},
				url: apiUrl+'/functions/search'
				});

		},

		getAutos: function(make, ty, con){
			var params = {};
			params.where = {};
			params.where.active = true;
			params.include = 'images';
			params.order = '-createdAt';
			if(make){
				params.where.make = make
			};
			if(ty){
				params.where.type = ty
			};
			if(con){
				params.where.condition = con
			};

			return $http(
				{
				method: 'GET',
				headers: mGetHeaderJson,
				params: params,
				url: apiUrl+'/classes/Autos'
				});
		},

		getBikes: function(make, ty, con){
			var params = {};
			params.where = {};
			params.where.active = true;
			params.include = 'images';
			params.order = '-createdAt';
			if(make){
				params.where.make = make
			};
			if(ty){
				params.where.type = ty
			};
			if(con){
				params.where.condition = con
			};

			return $http(
				{
				method: 'GET',
				headers: mGetHeaderJson,
				params: params,
				url: apiUrl+'/classes/Bikes'
				});
		},

		getTires: function(make, dia, width, height){
			var params = {};
			params.where = {};
			params.where.active = true;
			params.include = 'images';
			params.order = '-createdAt';
			if(make){
				params.where.make = make
			};
			if(dia){
				params.where.diameter = dia
			};
			if(width){
				params.where.width = width
			};
			if(height){
				params.where.height = height
			};

			return $http(
				{
				method: 'GET',
				headers: mGetHeaderJson,
				params: params,
				url: apiUrl+'/classes/Tires'
				});
		},

		getAutoDetail: function(ref){
			return $http(
					{
					method: 'GET',
					headers: mGetHeaderJson,
					params: {
						// 'where':{
						// 	'active': true
						// },
			         	'include':'images'
					},
					url: apiUrl+'/classes/Autos/'+ref
					});
		},

		getBikeDetail: function(ref){
			return $http(
					{
					method: 'GET',
					headers: mGetHeaderJson,
					params: {
						// 'where':{
						// 	'active': true
						// },
			         	'include':'images'
					},
					url: apiUrl+'/classes/Bikes/'+ref
					});
		},

		getTireDetail: function(ref){
			return $http(
					{
					method: 'GET',
					headers: mGetHeaderJson,
					params: {
						// 'where':{
						// 	'active': true
						// },
			         	'include':'images'
					},
					url: apiUrl+'/classes/Tires/'+ref
					});
		},

		getOrders: function(id){
			return $http(
					{
					method: 'GET',
					headers: mGetHeaderJson,
					params: {
						'where':{
							'userId': id
						},
						'order' : '-createdAt',
			         	'include':'items'
					},
					url: apiUrl+'/classes/Orders/'
					});
		},

	};


}])

// Capitalize filter
.filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});

// Capitalize function
function Capitalize(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}


// Remove a elements fron an array
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

