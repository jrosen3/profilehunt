var app = angular.module('ProfileHunt',["angucomplete"])
  .controller('page', ['$scope', function ($scope) {
    //Init Parse
    Parse.initialize("n8jGCT80CjVisMzAjmIcf7AqyFiYVa9kPuZ6HJDk", "461lPAhmknRzQbrlxDHnKax15eC7x30oJjlG11Eb");
    
    $scope.firstname = null;
    $scope.profilepic = null;
    

    //get tags from database
    $scope.tags = [];
    $scope.tagList = [];
    var Tags = Parse.Object.extend("Tags");
    var query = new Parse.Query(Tags);
    query.find({
      success: function(results) {
        // results is an array of Parse.Object.
        for (i = 0; i < results.length; i++){
          var tag_name = results[i].attributes.tag_name; 
          $scope.tagList.push(tag_name);
          $scope.tags.push({"name": tag_name});
        }
        $scope.$apply();
      },
      error: function(error) {
        // error is an instance of Parse.Error.
      }
    });
        
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

    $scope.choices = [];

    $scope.$on('sendTagChecked', function(event, data){
      if ($scope.choices.indexOf(data) == -1) {
        $scope.choices.push(data);
      } else {
        // console.log('this tag has already been added');
      }
    });

    $scope.$on('sendTagUnChecked', function(event, data){
      var temp_tagList = $scope.tagList.map(function(s){return s.toLowerCase()});
      var temp_choices = $scope.choices.map(function(s){return s.toLowerCase()});
      var temp_data = data.toLowerCase();
      if (temp_tagList.indexOf(temp_data) > -1) {
        if(temp_choices.indexOf(temp_data) == -1){
          $scope.choices.push($scope.tagList[temp_tagList.indexOf(temp_data)]);
        } else {
          // console.log("this tag has already been added");
        }
      } else {
        // console.log('this is not a valid tag');
      }
    });

    $scope.deleteTag = function(tag) {
      var index = $scope.choices.indexOf(tag);
      if (index > -1) {
        $scope.choices.splice(index, 1);
      }
      // console.log($scope.choices);
    };

    $scope.submit = function(){
      var url = this.url;
      var des = this.description;
      var name = this.name;
      if (!currentUser) {
        alert("Please log in to add a profile. Please sign up");
      } else {
        var Profile = Parse.Object.extend("Profile");
        var Creators = Parse.Object.extend("Creators");
        var Endorsements = Parse.Object.extend("Endorsements");
        var Likes = Parse.Object.extend("Likes");
        var Tags = Parse.Object.extend("Tags");
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
              } else if ($scope.choices.length < 1) {
                // console.log("add more tags");
              } else {
                var profile = new Profile();
                var creators = new Creators();
                var profileObject = null;
                var creatorsObject = null;

                profile.save({"name":name, "url":url, "description":des})
                .then(function(profileObject) {
                  // console.log("profile saved");
                  return profileObject;
                })
                .then(function(profileObject) {
                  // once profile is saved
                  creators.save({"user":currentUser, "profile":profileObject, "date":Date()})
                  .then(function(creatorsObject) {
                    // console.log("creators saved");
                    return creatorsObject;
                  })
                  .then(function(creatorsObject) {
                    // once the creatos is saved
                    $scope.choices.forEach(function(c) {
                      var query = new Parse.Query(Tags);
                      query.equalTo("tag_name", c);
                      query.find({
                        success: function(t) {
                          // if the tag is found
                          var endorsements = new Endorsements();
                          endorsements.save({"profile":profileObject, "upvotes":1, "tag":t[0]});
                          var likes = new Likes();
                          likes.save({"profile":profileObject, "user":currentUser, "tag":t[0]});
                        }
                      });
                    });

                    console.log("you have added the profile")
                    // pause for two seconds

                    $scope.choices = [];
                    $scope.name = null;
                    $scope.url = null;
                    $scope.description = null;
                    $scope.$apply();
                    $("#add-modal").trigger('closeModal');
                  });
                }); 
              }
            }
          }
        });
      }  
    }
  }]); /* end of controller */ 
/* var app */



app.directive('backImg', function(){
  return function(scope, element, attrs){
    attrs.$observe('backImg', function(value) {
      element.css({
        'background-image': 'url(' + value +')'
      });
    });
  };
});



