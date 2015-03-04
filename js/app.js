angular.module('esri-webmap-example', ['esri.map', 'ngSanitize'])
  .controller('MapController', function ($scope, esriRegistry) {
    $scope.map = {
        center: {
            lng: -3.709,
            lat: 40.4329
        },
        zoom: 13
    };
    $scope.counter = 0;
    $scope.pois = Array();
    $scope.evt = { click: {}};

    esriRegistry.get('map').then(function(map) {
      require([
        "esri/map",
        "esri/layers/GraphicsLayer",    
        "esri/geometry/Point",  
        "esri/symbols/PictureMarkerSymbol",     
        "esri/graphic", 
        "esri/geometry/webMercatorUtils",
        "dojo/domReady!"
        ], function(
          Map, GraphicsLayer, Point, PictureMarkerSymbol, Graphic, webMercatorUtils
          ) {

          $scope.capaGrafica = new GraphicsLayer(); 
          map.addLayer($scope.capaGrafica);
          $scope.Point = Point;
          $scope.PictureMarkerSymbol = PictureMarkerSymbol;
          $scope.Graphic = Graphic;
          $scope.webMercatorUtils = webMercatorUtils;    
      });

      map.on('click', function(e) {
        //console.log('map click', e);
        
        var poi;
        var point = e.mapPoint;
        var LongLat = $scope.webMercatorUtils.xyToLngLat(point.x, point.y);
        
        
        $scope.$apply(function(){
            $scope.evt.click.lng = LongLat[0].toFixed(3);
            $scope.evt.click.lat = LongLat[1].toFixed(3);  
            
            poi = {
              id: $scope.counter,
              lng: $scope.evt.click.lng,
              lat: $scope.evt.click.lat,
              radius: 1000,
              name: ""
            };

            $scope.pois.push(poi);
            $scope.counter++;
        });

        var loc = new $scope.Point(
              $scope.evt.click.lng,
              $scope.evt.click.lat
            ); 

        var symbol = new $scope.PictureMarkerSymbol("img/pin.png", 16, 24); 
        $scope.capaGrafica.add(new $scope.Graphic(loc, symbol, poi));         
      });
  });

  $scope.delete = function(id){
    
    var i = 0, 
        layer = $scope.capaGrafica,
        pois = $scope.pois,
        len = pois.length;
    
    while(i <= len){
      if(pois[i].id == id){
        pois.splice(i, 1);
        layer.remove(layer.graphics[i]);
        break;
      }
      i++;
    }
  };
});