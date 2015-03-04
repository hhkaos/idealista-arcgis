var $GEO = $GEO || {
  params: {
    action: 'json',
    apikey: '0lVOkSbmEM5iIo7pAPFprxFUUuJUCZXU', // <- Valido para desarrolladores.esri.es
    country: "es",
    maxItems: 50,
    numPage: 1,
    distance: 1002,
    center: "40.42938099999995,-3.7097526269835726"
  }
};

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
    $scope.results = Array();
    $scope.waiting = false;
    $scope.loadButton = "Buscar pisos";
    $scope.idealista = {
      noSmokers: true,
      sex: "I",
      operation: "A",
      order: "price",
      pictures: true,
      propertyType: "bedrooms"
    };

    var idealistaEndpoint = "http://idealista-prod.apigee.net/public/2/search";

    esriRegistry.get('map').then(function(map) {
      require([
        "esri/map",
        "esri/layers/GraphicsLayer",    
        "esri/geometry/Point",  
        "esri/symbols/PictureMarkerSymbol",     
        "esri/graphic", 
        "esri/geometry/webMercatorUtils",
        "esri/request",
        "esri/Color",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/renderers/SimpleRenderer",
        "esri/InfoTemplate",
        "dojo/promise/all",
        "dojo/Deferred",
        "dojo/domReady!",
        ], function(
          Map, GraphicsLayer, Point, PictureMarkerSymbol, Graphic, 
          webMercatorUtils, esriRequest, Color, SimpleMarkerSymbol, 
          SimpleRenderer, InfoTemplate, all
          ) {
          //debugger;
          $scope.capaGrafica = new GraphicsLayer(); 
          map.addLayer($scope.capaGrafica);

          $scope.Point = Point;
          $scope.PictureMarkerSymbol = PictureMarkerSymbol;
          $scope.Graphic = Graphic;
          $scope.webMercatorUtils = webMercatorUtils;
          $scope.esriRequest = esriRequest;
          $scope.allDojo = all;

          esriConfig.defaults.io.proxyUrl = "http://www.rauljimenez.info/dev/proxy/proxy.php";
          esriConfig.defaults.io.alwaysUseProxy = false;

          var orangeRed = new Color([238, 69, 0, 0.5]);
          $GEO.marker = new SimpleMarkerSymbol("solid", 10, null, orangeRed);
          var renderer = new SimpleRenderer($GEO.marker);
          $scope.capaGrafica.setRenderer(renderer);

          // Y asociamos un pequeño modal con información extra.
          var template = new InfoTemplate(
            "Precio: ${price}€",
            "Dirección: ${address} <br>\
            Planta: ${floor} <br>\
            <img src='${thumbnail}'> <br>\
            <a href='http://${url}' target='_blank'>Más info</a>"
          );
          $scope.capaGrafica.setInfoTemplate(template);

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

  $scope.search = function(){
    var lat = $scope.pois[0].lat,
        lng = $scope.pois[0].lng;
    
    $scope.waiting = true;
    $scope.loadButton = "Buscando...";

    $GEO.params.center = lat + "," + lng;
    $GEO.params.noSmokers = $scope.idealista.noSmokers;
    $GEO.params.sex = $scope.idealista.sex;
    $GEO.params.operation = $scope.idealista.operation;
    $GEO.params.order = $scope.idealista.order;
    $GEO.params.pictures = $scope.idealista.pictures;
    $GEO.params.propertyType = $scope.idealista.propertyType;

    var firstRequest = $scope.esriRequest({
      url: idealistaEndpoint,
      //url: "http://localhost:9090/js/response.js",
      content: $GEO.params,
      error: esriConfig.defaults.io.errorHandler
    });

    var paintResults = function(firstResult){
      var len = firstResult.elementList.length;
      var el = firstResult.elementList;
      
      $scope.$apply(function(){
        for(i=0; i<len; i++){
          
          $scope.results.push(el[i]);
          var loc = new $scope.Point(el[i].longitude, el[i].latitude);
          $scope.capaGrafica.add(new $scope.Graphic(loc, $GEO.marker, el[i]));
        }
      });
    };

    firstRequest.then(function(firstResult)
    {
      paintResults(firstResult);


      var i, totalPages = Math.min(100, firstResult.totalPages);

      var promises = [];

      for(i=2; i<totalPages; i++)
      {
        $GEO.params.numPage = i;
        setTimeout(function(){
          promises.push( $scope.esriRequest({
            url: idealistaEndpoint,
            content: $GEO.params,
            load: paintResults,
            error: esriConfig.defaults.io.errorHandler
          }));
        },1000);
      }

      var dl = new $scope.allDojo(promises).then(function(results)
      {
        console.log("all requests finished")

        //dojo.byId('idealista-count').innerHTML = baseGraphics.length + " resultados";
        $scope.waiting = false;
        $scope.loadButton = "Buscar pisos";
        deferred.resolve("ok");
      });
    });

  }
})
.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);;