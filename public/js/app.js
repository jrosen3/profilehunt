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
        results.forEach(function(t){
          $scope.tagList.push(t.attributes.tag_name);
          $scope.tags.push({"name": t.attributes.tag_name});
        })
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
        // console.log("nobody is logged in");
      }
    };

    //login function
    $scope.login = function(e){
      Parse.FacebookUtils.logIn(null, {
        success: function(user) {
          if (!user.existed()) {
            console.log("user signed up and logged in through Facebook");
          } else {
            console.log("user logged in through Facebook");
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
          console.log("user cancelled the Facebook login or did not fully authorize");
        }
      });
    }

    $scope.choices = [];

    $scope.$on('sendTagChecked', function(event, data){
      if ($scope.choices.indexOf(data) == -1) {
        $scope.choices.push(data);
        $scope.$apply();
      } else {
        // console.log('this tag has already been added');
        alertSubmitError("You already added this tag.", "p1", 5000);
      }
    });

    $scope.$on('sendTagUnChecked', function(event, data){
      var temp_tagList = $scope.tagList.map(function(s){return s.toLowerCase()});
      var temp_choices = $scope.choices.map(function(s){return s.toLowerCase()});
      var temp_data = data.toLowerCase();
      if (temp_tagList.indexOf(temp_data) > -1) {
        if(temp_choices.indexOf(temp_data) == -1){
          $scope.choices.push($scope.tagList[temp_tagList.indexOf(temp_data)]);
          $scope.$apply();
        } else {
          // console.log("this tag has already been added");
          alertSubmitError("You already added this tag.", "p1", 5000);
        }
      } else {
        // console.log('this is not a valid tag');
        alertSubmitError("This is not a valid tag.", "p0", 5000);
      }
    });

    $scope.deleteTag = function(tag) {
      var index = $scope.choices.indexOf(tag);
      if (index > -1) {
        $scope.choices.splice(index, 1);
        $scope.$apply();
      }
      // console.log($scope.choices);
    };

    $scope.submitError = null;
    $scope.priority = null;
    function alertSubmitError(text, priority, time){
      $scope.submitError = text;
      $scope.priority = priority;
      $scope.$apply();
      
      var delay = function(millis) {
        var promise = new Parse.Promise();
        setTimeout(function() {
          promise.resolve();
        }, millis);
        return promise;
      };

      delay(time).then(function() {
        $scope.submitError = null;
        $scope.$apply();
      });
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
              alertSubmitError("This profile has already been added.", "p0", 5000);
            } else {
              if (name == null) {
                // console.log("bad name");
                alertSubmitError("Please enter a valid name", "p0", 5000);
              } else if (name.length < 1) {
                // console.log("add full name");
                alertSubmitError("Please enter a valid name", "p0", 5000);
              } else if (url == null) {
                // console.log("bad url");
                alertSubmitError("Please enter a valid url", "p0", 5000);
              } else if (url.length < 10) {
                // console.log("add full url");
                alertSubmitError("Please enter a valid url", "p0", 5000);
              } else if (des == null) {
                // console.log("bad description");
                alertSubmitError("Please enter a valid description", "p0", 5000);
              } else if (des.length < 10) {
                // console.log("add full description");
                alertSubmitError("Please enter a valid description", "p0", 5000);
              } else if (des.lenght > 100) {
                // console.log("keep the description short");
                alertSubmitError("Please keep the description brief, less than 100 caracters", "p0", 5000);
              } else if ($scope.choices.length < 2) {
                // console.log("add more tags");
                alertSubmitError("Please enter at least two tags", "p0", 5000);
              } else {
                var profile = new Profile();
                var creators = new Creators();

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

                    // console.log("you have added the profile")
                    alertSubmitError("You successfully added the profile", "p2", 5000);

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



