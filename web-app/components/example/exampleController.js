'use strict';

/**
 * Primary controller for the component, used mostly to interact with the API's
 */

hotDogApp.controller('ExampleController', ['$scope','$http', function($scope,$http) {

   // $scope is the scope, $http deals with http functions
  $scope.graph = "";
  $scope.location = 'Stanford, California';
  
  var piAddress = "10.19.190.14"; // Location of raspberry pi on network 
  // Helper converts C to F
  var toF = function(c) {return c*9/5+32} 
  // Helper rounds to tens place
  var toTen = function(n) {return Math.round(10*n)/10}


  // Helper to classify temperature safety
  $scope.checkSafety = function(temp) {
    var t = parseFloat(temp);
    if (t > 100) return 0;
    if (t > 80) return 1;
    return 2;
  }
   
  // GETs hourly data from openweathermap
  var req1 = {
  	method: 'GET',
  	url: 'http://api.openweathermap.org/data/2.5/forecast?id=5398563&APPID=b90598af57d9d98af74bedc7b08dc494',
  }
	
	$http(req1).then(function(msg){

    // Sets variables based on OWM output, 
	$scope.weather = msg.data.list.map(function(a){ // Creates an array from every element
      var newDate = (new Date(1000 * a.dt)).getHours(); // Intermediate date variable
      var newHour = (((newDate - 1) % 12) + 1); // Converts date to hour
      newHour = "" + newHour + ((newHour == newDate) ? " AM" : " PM"); // Appends AM/PM
      return [toTen(toF(a.main.temp_max - 273))|| "?", newHour]}).slice(0,5); // Keeps only so many
		$scope.city = msg.data.city.name || "?";
	});

    // Gets temperature data from raspberry pi generated local server page
    var req2 = {
		method: 'GET',
		url: 'http://'+piAddress+':1880/mytemp',
	}
	
  // Set initial variable values
  $http(req2).then(function(msg){
    $scope.temperature = (toTen(toF(msg.data.temp)) || "?");
    $scope.tempset = JSON.parse(msg.data.tempdata) || [];
  });

    // Every second, check again
	setInterval(
	function(){
		$http(req2).then(function(msg){ // Ping the 
      $scope.temperature = toTen(toF(msg.data.temp)) || $scope.temperature;
      var safetyTypes = ["Dangerous", "Uncomfortable", "Safe"]; // Temperature classes
      var safetyColor = ["red", "#B63100", "#00897B"] // Temperature color classes
      var safeNum = $scope.checkSafety($scope.temperature); 
      $scope.safety = safetyTypes[safeNum];
      $scope.safeColor = safetyColor[safeNum]
      // If there's a new temp, updates
      $scope.tempset = JSON.parse(msg.data.tempdata) || $scope.tempset; 

      $scope.data = {
        dataset0: $scope.tempset.map(function(temper, index) { 
          //Creates dataset from temperatures
          return {"x": index, "val_0": toF(parseFloat(temper))};
        })
      };

      $scope.options = {
        series: [
          {
            axis: "y",
            dataset: "dataset0",
            key: "val_0",
            label: "Measured Temperatures",
            color: "#1f77b4",
            type: ['line', 'dot', 'area'],
            id: 'mySeries0'
          }
        ],
        axes: {x: {key: "x"},
               y: {min: 0}}
      };

    });
	}, 1000); 


}]);
