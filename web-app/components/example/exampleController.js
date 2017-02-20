'use strict';

/**
 * Defined a controller named 'ExampleController' that works with the view template
 * exampleTemplate.html.  We assume that cs142App has already been defined by
 * the main.js controller.  To access this view need to include the controller:
 *
 *  <script src="components/example/exampleController.js"></script>
 *
 * and its view template:
 *   <div ng-include="'components/example/exampleTemplate.html'" ng-controller="ExampleController"></div>
 */

cs142App.controller('ExampleController', ['$scope','$http', function($scope,$http) {

   // $scope.main is defined if we are a child $scope of the main $scope in which
   // case it contains the page's title property.  We update it so the page title
   // will include this view's name "Example".
   if ($scope.main) {
      $scope.main.title = 'Pets';
   }

  $scope.graph = "";
  $scope.location = 'Stanford, California';
  
  var toF = function(f) {return f*9/5+32} 
  var toTen = function(n) {return Math.round(10*n)/10}
	
  $scope.checkSafety = function(temp) {
    var t = parseFloat(temp);
    if (t > 100) return 0;
    if (t > 80) return 1;
    return 2;
  }

  var req1 = {
  	method: 'GET',
  	url: 'http://api.openweathermap.org/data/2.5/forecast?id=5398563&APPID=b90598af57d9d98af74bedc7b08dc494',
  }
	
	$http(req1).then(function(msg){
    console.log(msg);
		$scope.weather = msg.data.list.map(function(a){
      var newDate = (new Date(1000 * a.dt)).getHours();
      var newHour = (((newDate - 1) % 12) + 1);
      newHour = "" + newHour + ((newHour == newDate) ? " AM" : " PM");
      return [toTen(toF(a.main.temp_max - 273))|| "?", newHour]}).slice(0,5);
		$scope.city = msg.data.city.name || "?";
	});

    var req2 = {
		method: 'GET',
		url: 'http://10.19.190.14:1880/mytemp',
	}
	
	$http(req2).then(function(msg){
    $scope.temperature = (toTen(toF(msg.data.temp)) || "?");
    $scope.tempset = JSON.parse(msg.data.tempdata) || [];
  });
	setInterval(
	function(){
		$http(req2).then(function(msg){
      $scope.temperature = toTen(toF(msg.data.temp)) || $scope.temperature;
      var safetyTypes = ["Dangerous", "Uncomfortable", "Safe"];
      var safetyColor = ["red", "#B63100", "#00897B"]
      var safeNum = $scope.checkSafety($scope.temperature);
      $scope.safety = safetyTypes[safeNum];
      $scope.safeColor = safetyColor[safeNum]
      $scope.tempset = JSON.parse(msg.data.tempdata) || $scope.tempset;

      $scope.data = {
        dataset0: $scope.tempset.map(function(temper, index) { 
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
