
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

//HOVER related
// Target the relevant span tags in the station info div
let stationDisplay = document.getElementById('station');
let routeDisplay = document.getElementById('routes');

//FILTER related
// Holds visible airport features for filtering
let stations = [];

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

function featureUpdates(value, filtered){
  if(value){
    // Filter visible features that don't match the input value.
    filtered = stations.filter(function(feature) {
      let routes = normalize(feature.properties.routes);
      let station = normalize(feature.properties.station);
      return routes.indexOf(value) > -1 || station.indexOf(value) > -1;
    });
    renderListings(filtered);
    filtered.forEach(function(feature){
      filt_id.push(feature.id);
    });
    filt_id = [... new Set(filt_id)];
    res = all_id.filter( function(n) { return !this.has(n) }, new Set(filt_id) );

    filt_id.forEach(function(id){
      map.setFeatureState({
        source: 'stations',
        sourceLayer: 'bus_station',
        id: id
      }, {
        select: true
      });
    });

    res.forEach(function(id){
      map.setFeatureState({
        source: 'stations',
        sourceLayer: 'bus_station',
        id: id
      }, {
        select: false
      });
    });
  } else {
    all_id.forEach(function(id){
      map.setFeatureState({
        source: 'stations',
        sourceLayer: 'bus_station',
        id: id
      }, {
        select: false
      });
    });
  }
}


map.on('load', function(){
  map.addSource("stations", {
    "type": "vector",
    "url": "mapbox://shihwenwutw.dwtsgvgn"
  });

  map.addLayer({
    'id': 'station-origin',
    'type': 'circle',
    'source': 'stations',
    'layout':{
      'visibility': 'visible'
    },
    'source-layer': 'bus_station',
    'paint': {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        6,
        3
      ],
      'circle-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        'red',
        ['boolean', ['feature-state', 'select'], false],
        'orange',
        'white'
      ],

      'circle-stroke-width': 0.3,
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
    if (features) {
      // Populate features for the listing overlay.
      //renderListings(uniqueFeatures);
      renderListings(features);

      // Clear the input container
      //filterEl.value = '';

      // Store the current features in sn `airports` variable to
      // later use for filtering on `keyup`.
      //airports = uniqueFeatures;
    }
    stations = features;

    stations.forEach(function(feature){
      all_id.push(feature.id);
    });
    featureUpdates(value,filtered);

  });
  let hoveredStateId = null;

  map.on('mousemove', 'station-origin', function(e){
    if (e.features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';
      if (hoveredStateId) {
        // set the hover attribute to false with feature state
        map.setFeatureState({
          source: 'stations',
          sourceLayer: 'bus_station',
          id: hoveredStateId
        }, {
          hover: false
        });
      }

      hoveredStateId = e.features[0].id;
      map.setFeatureState({
        source: 'stations',
        sourceLayer: 'bus_station',
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
        sourceLayer: 'bus_station',
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
    stations.forEach(function(feature){
      all_id.push(feature.id);
    });
    featureUpdates(value,filtered);

  });
  // Call this function on initialization
  // passing an empty array to render an empty state
  renderListings([]);
});
