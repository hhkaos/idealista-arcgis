// Objeto JSON con parámetros por defecto para la API de Idealista
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

// Creamos el módulo con las dependecias a
// esri.map -> Directivas creadas por Esri 
// ngSanitize -> Modulo para poder renderizar una cadena con HTML
angular.module('idealista-arcgis', ['esri.map', 'ngSanitize'])
  .controller('MapController', function ($scope, esriRegistry) {
    //Creamos el controlador (MapController)
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
    
    // Definimos la configuración por defecto de la búsqueda
    $scope.idealista = {
      noSmokers: true,
      sex: "X",
      operation: "A",
      order: "price",
      pictures: true,
      propertyType: "bedrooms",
      pets: "false"
    };

    var idealistaEndpoint = "http://idealista-prod.apigee.net/public/2/search";

    // Servicio de esri-map que devuelve el un mapa
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
          
          // Aquí creamos las capas y las metemos en la variable de entorno 
          // ($scope) para poder acceder luego desde fuera de la función
          $scope.capaGrafica = new GraphicsLayer();
          map.addLayer($scope.capaGrafica);

          $scope.Point = Point;
          $scope.PictureMarkerSymbol = PictureMarkerSymbol;
          $scope.Graphic = Graphic;
          $scope.webMercatorUtils = webMercatorUtils;
          $scope.esriRequest = esriRequest;
          $scope.allDojo = all;

          esriConfig.defaults.io.proxyUrl = "/proxy";
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

      // Añadimos un marcados al hacer clic
      map.on('click', function(e) {
        var poi;
        var point = e.mapPoint;
        var LongLat = $scope.webMercatorUtils.xyToLngLat(point.x, point.y);

        $scope.$apply(function(){
            // Necesitamos ejecutar el método $apply para actualizar los 
            // enlaces (bindings) y recuperar la latitud y longitud real
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

  // Definimos un método delete(id) para eliminar un POI del mapa
  $scope.delete = function(id){
    var i = 0,
        layer = $scope.capaGrafica,
        pois = $scope.pois,
        len = pois.length;

    // Recorremos el Array de POIs en busca del que queremos borrar.
    while(i <= len){
      if(pois[i].id == id){
        pois.splice(i, 1);
        layer.remove(layer.graphics[i]);
        break;
      }
      i++;
    }
  };

  // Pintar resultados 
  var paintResults = function(result){
    var len = result.elementList.length;
    var el = result.elementList;

    $scope.$apply(function(){
      for(i=0; i<len; i++){
        $scope.results.push(el[i]);
        var loc = new $scope.Point(el[i].longitude, el[i].latitude);
        $scope.capaGrafica.add(new $scope.Graphic(loc, $GEO.marker, el[i]));
      }
    });
  };

  // Método para lanzar la búsqueda sobre un punto a la API de Idealista
  var endpointRequest = function(poiId) {
    var lat = $scope.pois[poiId].lat;
    var lng = $scope.pois[poiId].lng;

    // Establecemos la localización el radio de la búsqueda
    $GEO.params.center = lat + "," + lng;
    $GEO.params.distance = $scope.pois[poiId].radius;

    // Lanzamos la petición
    var deferred = $scope.esriRequest({
      url: idealistaEndpoint,
      content: $GEO.params,
      load: paintResults,
      error: function(e){
        console.log("Ha habido un error: "+ e);
      }
    });
    // Devolvemos la promesa devuelta por el método esriRequest.
    // Más info sobre las prromesas y el objetos Deferred: http://bit.ly/1cKr1lR
    return deferred.promise;
  }

  // Método para lanzar la búsqueda sobre todos los POIs
  $scope.search = function(){
    $scope.waiting = true;
    $scope.loadButton = "Buscando...";

    $GEO.params.noSmokers = $scope.idealista.noSmokers;
    $GEO.params.sex = $scope.idealista.sex;
    $GEO.params.operation = $scope.idealista.operation;
    $GEO.params.order = $scope.idealista.order;
    $GEO.params.pictures = $scope.idealista.pictures;
    $GEO.params.propertyType = $scope.idealista.propertyType;

    var i;
    //, totalPages = Math.min(100, firstResult.totalPages);

    var promises = [];
    var poisNum = $scope.pois.length;

    for(i=0; i<poisNum; i++)
    {
      //$GEO.params.numPage = i;
      setTimeout(function(i) {
        promises.push(endpointRequest(i));
      }, i*2000, i);
    }

    setTimeout(function() {
      $scope.allDojo(promises).then(function(results)
      {
        console.log("all requests finished");

        //paintResults(results);
        //dojo.byId('idealista-count').innerHTML = baseGraphics.length + " resultados";
        $scope.waiting = false;
        $scope.loadButton = "Buscar pisos";
      },function(e){
        alert("Ha sucedido un error al recuperar los pisos, por favor inténtalo de nuevo.");
        $scope.waiting = false;
        $scope.loadButton = "Buscar pisos";
      });
    },poisNum*2000);
  }
})
.filter('trusted', ['$sce', function ($sce) {
    // Filtro generado para poder usar variables enlazadas (bindings) en las
    // URLs de la etiquetas; como por ejemplo: <img ng-src="{{r.thumbnail}}">
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);;
