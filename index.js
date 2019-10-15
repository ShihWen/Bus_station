
mapboxgl.accessToken = 'pk.eyJ1Ijoic2hpaHdlbnd1dHciLCJhIjoiY2poZTMweWFzMHFqMjMwcGMxODB4ZnF2NSJ9.Z26UldBScU4ycC75f24TnA';

let map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/shihwenwutw/ck1myebc70e851co3unmss075', // stylesheet location
  center: [121.55244833917465, 25.03793365035355], // starting position [lng, lat]
  zoom: 12,
  minZoom: 10,
  maxZoom: 17 // starting zoom
});
let nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-right');

const source_layer = 'bus_station_greaterTPE_2';
const source_url = "mapbox://" + "shihwenwutw.4y51xvvi"


const source_layer_2 = 'bus_route'
const source_url_2 = "mapbox://" + 'shihwenwutw.6d7z5jz7'


//HOVER related
// Target the relevant span tags in the station info div
let stationDisplay = document.getElementById('station');
let routeDisplay = document.getElementById('routes');

//FILTER related
// Holds visible features for filtering
let stations = [];
let routes = [];

// Create a popup, but don't add it to the map yet.
let popup = new mapboxgl.Popup({
  closeButton: false
});

let filterEl = document.getElementById('feature-filter');
let listingEl = document.getElementById('feature-listing');

//feature improvement
let value = '';
let filtered = [];
let all_id = [];
let filt_id = [];
let res = [];

let filtered_r = [];
let all_id_r = [];
let filt_id_r = [];
let res_r = [];

function renderListings(features) {
  // Clear any existing listings
  listingEl.innerHTML = '';
  if (features.length) {
    features.forEach(function(feature) {
      let prop = feature.properties;
      let item = document.createElement('p');
      item.textContent = prop.station;
      item.addEventListener('mouseover', function() {
        // Highlight corresponding feature on the map
        popup.setLngLat(feature.geometry.coordinates)
        .setText(feature.properties.station + ' (' + feature.properties.routes.replace(/"|\[|\]/g,'').replace(/,/g,', ') + ')')
        .addTo(map);
      });
      listingEl.appendChild(item);
    });

    // Show the filter input
    filterEl.parentNode.style.display = 'block';
  } else {
    let empty = document.createElement('p');
    empty.textContent = 'No results, drag or change words to populate';
    listingEl.appendChild(empty);

    // Hide the filter input
    //filterEl.parentNode.style.display = 'none';

    // remove features filter
    map.setFilter('station-origin', ['has', 'routes']);
  }
}

function normalize(string) {
  return string.trim().toLowerCase();
}

function getUniqueFeatures(array, comparatorProperty) {
  let existingFeatureKeys = {};
  // Because features come from tiled vector data, feature geometries may be split
  // or duplicated across tile boundaries and, as a result, features may appear
  // multiple times in query results.
  let uniqueFeatures = array.filter(function(el) {
    if (existingFeatureKeys[el.properties[comparatorProperty]]) {
      return false;
    } else {
      existingFeatureKeys[el.properties[comparatorProperty]] = true;
      return true;
    }
  });

  return uniqueFeatures;
}

//Update Station Feature
function featureUpdates(value, filtered_input){
  if(value){
    // Filter visible features that don't match the input value.
    filtered_input = stations.filter(function(feature) {
      let routes = normalize(feature.properties.routes);
      let station = normalize(feature.properties.station);
      return routes.indexOf(value) > -1 || station.indexOf(value) > -1;
    });
    renderListings(filtered_input);
    filtered_input.forEach(function(feature){
      filt_id.push(feature.id);
    });
    filt_id = [... new Set(filt_id)];
    res = all_id.filter( function(n) { return !this.has(n) }, new Set(filt_id) );

    filt_id.forEach(function(id){
      map.setFeatureState({
        source: 'stations',
        sourceLayer: source_layer,
        id: id
      }, {
        select: true
      });
    });

    res.forEach(function(id){
      map.setFeatureState({
        source: 'stations',
        sourceLayer: source_layer,
        id: id
      }, {
        select: false
      });
    });
  } else {
    all_id.forEach(function(id){
      map.setFeatureState({
        source: 'stations',
        sourceLayer: source_layer,
        id: id
      }, {
        select: false
      });
    });
  }
}

//Update Route Feature
function featureUpdates_r(value, filtered_input){
  if(value){
    // Filter visible features that don't match the input value.
    filtered_input = routes.filter(function(feature) {
      let routes = normalize(feature.properties.RouteNameZ);
      return routes.indexOf(value) > -1;
    });
    //renderListings(filtered);
    filtered_input.forEach(function(feature){
      filt_id_r.push(feature.id);
    });
    filt_id_r = [... new Set(filt_id_r)];
    res_r = all_id_r.filter( function(n) { return !this.has(n) }, new Set(filt_id_r) );

    filt_id_r.forEach(function(id){
      map.setFeatureState({
        source: 'routes',
        sourceLayer: source_layer_2,
        id: id
      }, {
        select: true
      });
    });

    res_r.forEach(function(id){
      map.setFeatureState({
        source: 'routes',
        sourceLayer: source_layer_2,
        id: id
      }, {
        select: false
      });
    });
  } else {
    all_id_r.forEach(function(id){
      map.setFeatureState({
        source: 'routes',
        sourceLayer: source_layer_2,
        id: id
      }, {
        select: false
      });
    });
  }
}


map.on('load', function(){
  //Route Layer
  map.addSource("routes", {
    "type": "vector",
    "url": source_url_2
  });

  map.addLayer({
    'id': 'station-route',
    'type': 'line',
    'source': 'routes',
    'layout': {
      'visibility': 'visible'
    },
    'source-layer': source_layer_2,
    'paint': {
      'line-color': [
        'case',
        ['boolean', ['feature-state', 'select'], false],
        '#dd3497',
        'rgba(0,0,0,0)'
      ]
    }
  });

  //Station Layer
  map.addSource("stations", {
    "type": "vector",
    "url": source_url
  });

  map.addLayer({
    'id': 'station-origin',
    'type': 'circle',
    'source': 'stations',
    'layout':{
      'visibility': 'visible'
    },
    'source-layer': source_layer,
    'paint': {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        8,
        ['boolean', ['feature-state', 'select'], false],
        3.5,
        3
      ],
      'circle-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        'red',
        ['boolean', ['feature-state', 'select'], false],
        '#fff700',
        'white'
      ],

      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.9,
        ['boolean', ['feature-state', 'select'], false],
        0.7,
        0.3
      ],
      'circle-stroke-color':[
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        'black',
        ['boolean', ['feature-state', 'select'], false],
        'black',
        'rgba(0,0,0,0.25)'
      ],
    }
  });

  map.on('moveend', function() {
    let features = map.queryRenderedFeatures({layers: ['station-origin']});
    let features_routes = map.queryRenderedFeatures({layers: ['station-route']});
    if (features) {
      // Populate features for the listing overlay.
      //renderListings(uniqueFeatures);
      renderListings(features);
    }
    stations = features;
    routes = features_routes;

    stations.forEach(function(feature){
      all_id.push(feature.id);
    });
    routes.forEach(function(feature){
      all_id_r.push(feature.id);
    });

    featureUpdates(value,filtered);
    featureUpdates_r(value,filtered_r);
    console.log(map.getZoom());

  });


  let hoveredStateId = null;
  map.on('mousemove', 'station-origin', function(e){
    if (e.features.length > 0) {
      //console.log(e.features);
      map.getCanvas().style.cursor = 'pointer';
      if (hoveredStateId) {
        // set the hover attribute to false with feature state
        map.setFeatureState({
          source: 'stations',
          sourceLayer: source_layer,
          id: hoveredStateId
        }, {
          hover: false
        });
      }

      hoveredStateId = e.features[0].id;
      map.setFeatureState({
        source: 'stations',
        sourceLayer: source_layer,
        id: hoveredStateId
      }, {
        hover: true
      });

      let stationName = e.features[0].properties.station;
      let routes = e.features[0].properties.routes.replace(/"|\[|\]/g,'');
      routes = routes.replace(/,/g,', ');
      stationDisplay.textContent = stationName;
      routeDisplay.textContent = routes;
    }
  });

  // When the mouse leaves the station-origin layer, update the feature state of the
  // previously hovered feature.
  map.on("mouseleave", "station-origin", function() {
    map.getCanvas().style.cursor = '';
    if (hoveredStateId) {
      map.setFeatureState({
        source: 'stations',
        sourceLayer: source_layer,
        id: hoveredStateId
      }, {
        hover: false

      });
    }
    stationDisplay.textContent = '';
    routeDisplay.textContent = '';
    hoveredStateId =  null;
    popup.remove();
  });

  filterEl.addEventListener('keyup', function(e) {
    value = normalize(e.target.value);
    all_id = [];
    filt_id = [];
    all_id_r = [];
    filt_id_r = [];

    stations.forEach(function(feature){
      all_id.push(feature.id);
    });
    routes.forEach(function(feature){
      all_id_r.push(feature.id);
    });
    featureUpdates(value,filtered);
    featureUpdates_r(value,filtered_r);

  });
  // Call this function on initialization
  // passing an empty array to render an empty state
  renderListings([]);
});
