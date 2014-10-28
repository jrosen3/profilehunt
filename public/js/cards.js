angular.module('cards', [])
  .controller('card', ['$scope', function ($scope) {
  	$scope.$on('fbUser', function(event, data){
  		console.log(data);
  	});
  }]);