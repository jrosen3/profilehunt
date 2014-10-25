var app = angular.module('ProfileHunt',[])
  .controller('page', ['$scope', function ($scope) {
    //Init Parse
    Parse.initialize("n8jGCT80CjVisMzAjmIcf7AqyFiYVa9kPuZ6HJDk", "461lPAhmknRzQbrlxDHnKax15eC7x30oJjlG11Eb");
    
    $scope.firstname = null;
    $scope.profilepic = null;
    
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
        FB.api(
          "/me/picture",
          function (response) {
            if (response && !response.error) {
              $scope.profilepic = response.data.url;
              $scope.$apply();
            }
          }
        );
      } else {
        // no one logged in
        // console.log("nobody home");
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
          FB.api(
          "/me/picture",
          function (response) {
            if (response && !response.error) {
              $scope.profilepic = response.data.url;
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

   $scope.choices = [''];
  
  // $scope.addNewChoice = function() {
  //   var newItemNo = $scope.choices.length+1;
  //   $scope.choices.push({'value':'choice'+newItemNo});
  // };
  
  $scope.keypress = function(e) {
    if(e.keyCode == 13){
      console.log($scope.choices);
      $scope.choices.splice(($scope.choices.length - 1), 0, this.tagname);
      console.log($scope.choices);
    }
  };


    $scope.submit = function(){
      //disable enter key


      var url = this.url;
      var des = this.description;
      var tags = this.tags;
      var name = this.name;
      if (!currentUser) {
        alert("Please log in to add a profile. Please sign up");
      } else {
        var Profile = Parse.Object.extend("Profile");
        var query = new Parse.Query(Profile);
        query.equalTo("url", url);
        query.find({
          success: function(profiles){
            if(profiles.length > 0){
              console.log("it exists");
            } else {
              if (name == null) {
                // console.log("bad name");
              } else if (name.length < 1) {
                // console.log("add full name");
              } else if (url == null) {
                // console.log("bad url");
              } else if (url.length < 10) {
                // console.log("add full url");
              } else if (des == null) {
                // console.log("bad description");
              } else if (des.length < 10) {
                // console.log("add full description");
              } else if (tags == null){
                // console.log("bad tags");
              } else if (tags.length < 10) {
                // console.log("add more tags");
              } else {
                // process tags


                var profile = new Profile();
                profile.save({"name":name, "url": url, "description": des}).then(function(object){
                  $scope.name = null;
                  $scope.url = null;
                  $scope.description = null;
                  $scope.tags = null;
                  $scope.$apply();
                });

                // add everything new to proper table
              }; 
            }
          }
        });
      }  
    }
  // end of module  
  }]);

app.directive('backImg', function(){
  return function(scope, element, attrs){
    attrs.$observe('backImg', function(value) {
      element.css({
        'background-image': 'url(' + value +')'
      });
    });
  };
});



