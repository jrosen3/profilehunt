var app = angular.module('ProfileHunt',["angucomplete"])
  .controller('header', ['$scope', function ($scope) {
    
    Parse.initialize("n8jGCT80CjVisMzAjmIcf7AqyFiYVa9kPuZ6HJDk", "461lPAhmknRzQbrlxDHnKax15eC7x30oJjlG11Eb");

    $scope.firstname = null;
    $scope.profilepic = null;

    $scope.$on('tagID', function(event, data) {
      $scope.$broadcast('tagIDs', data);
    });
    
    
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
              $scope.$broadcast('fbUserB', [currentUser, $scope.firstname]);
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
                $scope.$broadcast('fbUserB', [currentUser, $scope.firstname]);
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
  }]); /* end of header controller */ 
/* end of var app */

app.controller('modal', ['$scope', function ($scope) {
  //Init Parse
  Parse.initialize("n8jGCT80CjVisMzAjmIcf7AqyFiYVa9kPuZ6HJDk", "461lPAhmknRzQbrlxDHnKax15eC7x30oJjlG11Eb");

  var currentUser = null;
  $scope.firstname = null;
  $scope.$on('fbUserB', function(event, data){
    // console.log(data);
    currentUser = data[0];
    $scope.firstname = data[1];
  });

  //get tags from database
  $scope.tags = [];
  $scope.tagList = [];
  $scope.tagIDs = {};
  var Tags = Parse.Object.extend("Tags");
  var query = new Parse.Query(Tags);
  query.find({
    success: function(results) {
      results.forEach(function(t){
        $scope.tagList.push(t.attributes.tag_name);
        $scope.tags.push({"name": t.attributes.tag_name});
        $scope.tagIDs[t.id] = t.attributes.tag_name
        $scope.$emit('tagID', $scope.tagIDs);
      })
      $scope.$apply();
    },
    error: function(error) {
      // error is an instance of Parse.Error.
    }
  });
  
  $scope.choices = [];

  $scope.$on('sendTagChecked', function(event, data){
    if ($scope.choices.indexOf(data) == -1) {
      $scope.choices.push(data);
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
}]); /* end modal controller */

app.controller('cards', ['$scope', function ($scope) {
  Parse.initialize("n8jGCT80CjVisMzAjmIcf7AqyFiYVa9kPuZ6HJDk", "461lPAhmknRzQbrlxDHnKax15eC7x30oJjlG11Eb");
  var currentUser = null;
  $scope.firstname = null;
  $scope.$on('fbUserB', function(event, data){
    // console.log(data);
    currentUser = data[0];
    $scope.firstname = data[1];
  });
  var tagIDs = null;
  $scope.$on('tagIDs', function(event, data){tagIDs = data;});

  $scope.allCards = [];

  var Profile = Parse.Object.extend("Profile");
  var query = new Parse.Query(Profile);
  query.descending("createdAt");
  query.limit(10);
  query.find().then(function(profiles){
    // console.log(profiles);
    return profiles.map(function(profile){return {'name':profile.attributes.name, 'id':profile.id, 'url':profile.attributes.url, 'des':profile.attributes.description, 'tags':[]}})
  }).then(function(profiles){
    // console.log(profiles);
    myf(profiles);
  });

  function myf(profiles) {
    // console.log(profiles);
    var Endorsements = Parse.Object.extend("Endorsements");
    var Profile = Parse.Object.extend("Profile");
    profile = profiles.forEach(function(profile) {
      var searchprofile = new Profile();
      searchprofile.id = profile.id;
      var query = new Parse.Query(Endorsements);
      query.descending("upvotes");
      query.equalTo("profile", searchprofile);
      query.find().then(function(results){
        // console.log(results);
        return results.map(function(result){return [result.attributes.tag.id, result.attributes.upvotes]})
      }).then(function(results){
        profile.tags = results
        // $scope.allCards.push(profile);
        mylf(profile);
      });
    });
  };

  function mylf(profile) {
    profile.tags = profile.tags.map(function(tag) {
      return [tag[0], tagIDs[tag[0]], tag[1]];
    });
    $scope.allCards.push(profile);
    // console.log($scope.allCards);
    $scope.$apply();
  };


  $scope.liked = function(tag, profile) {
    checkTagLike(tag, profile, function(r){
      var id = '#' + tag + profile;
      if (r == 1) {
        $(id).addClass("liked-tag");
      } else {
        $(id).addClass("not-liked-tag");
      };
    });
  };

  function checkTagLike(tag, profile, cb){
    // console.log(tag, profile);
    var Likes = Parse.Object.extend("Likes");
    var Tags = Parse.Object.extend("Tags");
    var Profiles = Parse.Object.extend("Profiles");

    var searchprofile = new Profile();
    searchprofile.id = profile;

    var searchtag = new Tags();
    searchtag.id = tag;

    var query = new Parse.Query(Likes);
    query.equalTo("user", currentUser);
    query.equalTo("profile", searchprofile);
    query.equalTo("tag", searchtag);

    query.count().then(function(results){
      return results
    }).then(function(results){
      cb(results);
    });
  };

}]); /* end cards conroller*/


app.directive('backImg', function(){
  return function(scope, element, attrs){
    attrs.$observe('backImg', function(value) {
      element.css({
        'background-image': 'url(' + value +')'
      });
    });
  };
});



