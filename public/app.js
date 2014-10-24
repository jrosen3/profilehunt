angular.module('ProfileHunt',[])
	.controller('page', ['$scope', function ($scope) {
		//Init Parse
		Parse.initialize("n8jGCT80CjVisMzAjmIcf7AqyFiYVa9kPuZ6HJDk", "461lPAhmknRzQbrlxDHnKax15eC7x30oJjlG11Eb");
		
		$scope.firstname = null;
		
		//check current user
		var currentUser = Parse.User.current();
		window.fbAsyncInit = function() {
      Parse.FacebookUtils.init({
        appId      : '305754959632045',
        xfbml      : true,
        version    : 'v2.1'
      });

      // once FB api is loaded
      if (currentUser) {
  			// do stuff with the user
  			FB.api(
					"/me",
					function (response) {
						if (response && !response.error) {
							$scope.firstname = response.first_name;
							$scope.$apply();
						}
					}
				);
			} else {
		    // no one logged in
		    console.log("nobody home");
		  }
		};

		//login function
    $scope.login = function(e){
    	Parse.FacebookUtils.logIn(null, {
				success: function(user) {
			    if (!user.existed()) {
			      // alert("User signed up and logged in through Facebook!");
			    } else {
			      // alert("User logged in through Facebook!");
			    }
			    //update current user
			    currentUser = Parse.User.current();
			    FB.api(
						"/me",
						function (response) {
							if (response && !response.error) {
								$scope.firstname = response.first_name;
								$scope.$apply();
							}
						}
					);
			  },
			  error: function(user, error) {
			    // alert("User cancelled the Facebook login or did not fully authorize.");
				  }
			});
    }

    $scope.submit = function(){
    	var url = this.url;
    	var des = this.description;
			if (!currentUser) {
				alert("Please log in to add a profile. Please sign up");
			} else if ((url != null) && (des != null)){
	    	var Profile = Parse.Object.extend("Profile");
	    	var query = new Parse.Query(Profile);
	    	query.equalTo("url", url);
	    	query.find({
	    		success: function(profiles){
	    			if(profiles.length > 0){
	    				console.log("it exists");
	    			} else if (url.length > 5 && des.length > 5){
	    				var profile = new Profile();
	    				profile.save({"url": url, "description": des}).then(function(object){
		    				$scope.url = null;
		    				$scope.description = null;
		    				$scope.$apply();
	    				});
	    			}
	    		}
	    	});	
    	} 
    }


	}]);