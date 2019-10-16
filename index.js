
mapboxgl.accessToken = 'pk.eyJ1Ijoic2hpaHdlbnd1dHciLCJhIjoiY2poZTMweWFzMHFqMjMwcGMxODB4ZnF2NSJ9.Z26UldBScU4ycC75f24TnA';

let map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/shihwenwutw/ck1myebc70e851co3unmss075', // stylesheet location
  center: [121.55244833917465, 25.03793365035355], // starting position [lng, lat]
  zoom: 12,
  minZoom: 11,
  maxZoom: 17 // starting zoom
});
let nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-right');
//Station layer
const source_layer = 'bus_station_greaterTPE_2';
const source_url = "mapbox://" + "shihwenwutw.4y51xvvi"
//Route layer
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

//selected feature
let value = '';
let filtered = [];
let all_id = [];
let filt_id = [];
let res = [];

let filtered_r = [];
let all_id_r = [];
let filt_id_r = [];
let res_r = [];

//clicked feature
let access = [];
let click = false;

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

    // remove features filter
    map.setFilter('station-access', ['has', 'routes']);
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
      //return routes.indexOf(value) > -1 || station.indexOf(value) > -1;
      return value in feature.properties || station.indexOf(value) > -1;
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
      return value === feature.properties.RouteNameZ;
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

//Gether feature id on the map with corresponding routes
let renderListing_click = [];
function featureUpdates_click_id(value, filteredInputPoint, filteredInputLine){

  //Station
  filteredInputPoint = stations.filter(function(feature) {
    let routes = normalize(feature.properties.routes);
    let station = normalize(feature.properties.station);
    //return routes.indexOf(value) > -1 || station.indexOf(value) > -1;
    return value in feature.properties || station.indexOf(value) > -1;
  });
  //console.log(filteredInputPoint);
  filteredInputPoint.forEach(function(feature){
    filt_id.push(feature.id);
    renderListing_click.push(feature);
  });
  filt_id = [... new Set(filt_id)];
  renderListing_click = [... new Set(renderListing_click)];

  //Route
  filteredInputLine = routes.filter(function(feature) {
    let routes = normalize(feature.properties.RouteNameZ);
    //return routes.indexOf(value) > -1;
    return value === feature.properties.RouteNameZ;
  });

  filteredInputLine.forEach(function(feature){
    filt_id_r.push(feature.id);
  });
  filt_id_r = [... new Set(filt_id_r)];
}

//Generate features except from featureUpdates_click_id
function featureUpdates_res_id(){
  res = all_id.filter( function(n) { return !this.has(n) }, new Set(filt_id) );
  res_r = all_id_r.filter( function(n) { return !this.has(n) }, new Set(filt_id_r) );
};

//Update feature status
function featureUpdates_click(){
  filt_id_r.forEach(function(id){
    map.setFeatureState({
      source: 'routes',
      sourceLayer: source_layer_2,
      id: id
    }, {
      click: true
    });
  });

  res_r.forEach(function(id){
    map.setFeatureState({
      source: 'routes',
      sourceLayer: source_layer_2,
      id: id
    }, {
      click: false
    });
  });

  filt_id.forEach(function(id){
    map.setFeatureState({
      source: 'stations',
      sourceLayer: source_layer,
      id: id
    }, {
      click: true
    });
  });

  res.forEach(function(id){
    map.setFeatureState({
      source: 'stations',
      sourceLayer: source_layer,
      id: id
    }, {
      click: false
    });
  });


}

const zoomThreshold = 11.75;

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
        ['boolean', ['feature-state', 'click'], false],
        '#8856a7',
        'rgba(0,0,0,0)'
      ]
    }
  });

  //Station Layers
  map.addSource("stations", {
    "type": "vector",
    "url": source_url
  });
  //Station Layer in smaller zoom
  map.addLayer({
    'id': 'station-origin-smallZoom',
    'type': 'circle',
    'source': 'stations',
    'layout':{
      'visibility': 'visible'
    },
    'source-layer': source_layer,
    'maxzoom': zoomThreshold,
    'paint': {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        8,
        ['boolean', ['feature-state', 'select'], false],
        2,
        ['boolean', ['feature-state', 'clickMain'], false],
        4,
        ['boolean', ['feature-state', 'click'], false],
        2,
        1
      ],
      'circle-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        'red',
        ['boolean', ['feature-state', 'select'], false],
        '#fff700',
        ['boolean', ['feature-state', 'clickMain'], false],
        'red',
        ['boolean', ['feature-state', 'click'], false],
        '#f7fcb9',
        'rgba(0,0,0,0)'
      ],

      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.9,
        ['boolean', ['feature-state', 'select'], false],
        0.7,
        ['boolean', ['feature-state', 'clickMain'], false],
        0.7,
        ['boolean', ['feature-state', 'click'], false],
        0.7,
        0.3
      ],
      'circle-stroke-color':[
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        'black',
        ['boolean', ['feature-state', 'select'], false],
        'black',
        ['boolean', ['feature-state', 'clickMain'], false],
        'black',
        ['boolean', ['feature-state', 'click'], false],
        'black',
        'rgba(0,0,0,0.25)'
      ],
    }
  });
  //Station Layer in larger zoom
  map.addLayer({
    'id': 'station-access',
    'type': 'circle',
    'source': 'stations',
    'layout':{
      'visibility': 'visible'
    },
    'source-layer': source_layer,
    'minzoom': zoomThreshold,
    'paint': {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        8,
        ['boolean', ['feature-state', 'select'], false],
        3.5,
        ['boolean', ['feature-state', 'clickMain'], false],
        6,
        ['boolean', ['feature-state', 'click'], false],
        3.5,
        3
      ],
      'circle-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        'red',
        ['boolean', ['feature-state', 'select'], false],
        '#fff700',
        ['boolean', ['feature-state', 'clickMain'], false],
        'red',
        ['boolean', ['feature-state', 'click'], false],
        '#f7fcb9',
        'white'
      ],

      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.9,
        ['boolean', ['feature-state', 'select'], false],
        0.7,
        ['boolean', ['feature-state', 'clickMain'], false],
        0.9,
        ['boolean', ['feature-state', 'click'], false],
        0.7,
        0.3
      ],
      'circle-stroke-color':[
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        'black',
        ['boolean', ['feature-state', 'select'], false],
        'black',
        ['boolean', ['feature-state', 'click'], false],
        'black',
        'rgba(0,0,0,0.25)'
      ],
    }
  });


  map.on('moveend', function() {
    //Get features after 'moveend'
    let features = map.queryRenderedFeatures({layers: ['station-access']});
    let features_routes = map.queryRenderedFeatures({layers: ['station-route']});
    if (features) {
      // Populate features for the listing overlay.
      //renderListings(uniqueFeatures);
      renderListings(features);
    }
    stations = features;
    routes = features_routes;
    //Get all feature id after moveend
    stations.forEach(function(feature){
      all_id.push(feature.id);
    });
    routes.forEach(function(feature){
      all_id_r.push(feature.id);
    });

    //Update map according to search value while moving map
    //and turn off click event if it's on.
    featureUpdates(value,filtered);
    featureUpdates_r(value,filtered_r);
    //console.log(map.getZoom());

    all_id_r.forEach(function(id){
      map.setFeatureState({
        source: 'routes',
        sourceLayer: source_layer_2,
        id: id
      }, {
        click: false
      });
    });
    all_id.forEach(function(id){
      map.setFeatureState({
        source: 'stations',
        sourceLayer: source_layer,
        id: id
      }, {
        click: false
      });
    });

    //Update click result only if there is no value in search box
    if(!value && click === true){
      renderListing_click = [];
      access.forEach(function(routeInStation){
        featureUpdates_click_id(routeInStation,filtered,filtered_r);
        featureUpdates_res_id();
      })
      featureUpdates_click();
      renderListings(renderListing_click);

    }
    if(clickId){
      map.setFeatureState({
        source: 'stations',
        sourceLayer: source_layer,
        id: clickId
      }, {
        clickMain: true
      });
    }


  });


  let hoveredStateId = null;
  map.on('mousemove', 'station-access', function(e){
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
  map.on("mouseleave", "station-access", function() {
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

  let clickId = null;
  map.on("click", "station-access", function(e){
    if (e.features.length > 0) {
      click = true;
      filterEl.value = '';
      value = '';
      //turn off select results
      all_id_r.forEach(function(id){
        map.setFeatureState({
          source: 'routes',
          sourceLayer: source_layer_2,
          id: id
        }, {
          select: false
        });
      });

      all_id.forEach(function(id){
        map.setFeatureState({
          source: 'stations',
          sourceLayer: source_layer,
          id: id
        }, {
          select: false
        });
      });

      //Style clicked feature
      if (clickId) {
        map.setFeatureState({
          source: 'stations',
          sourceLayer: source_layer,
          id: clickId
        }, {
          clickMain: false
        });
      }

      clickId = e.features[0].id;
      map.setFeatureState({
        source: 'stations',
        sourceLayer: source_layer,
        id: clickId
      }, {
        clickMain: true
      });
      //Get all features on the map with selected attribu
      access = [];
      all_id = [];
      filt_id = [];
      all_id_r = [];
      filt_id_r = [];
      renderListing_click = [];

      access = e.features[0].properties.routes.replace(/"|\[|\]/g,'').split(',');
      stations.forEach(function(feature){
        all_id.push(feature.id);
      });
      routes.forEach(function(feature){
        all_id_r.push(feature.id);
      });

      access.forEach(function(value){
        featureUpdates_click_id(value,filtered,filtered_r);
        featureUpdates_res_id();
      })
      featureUpdates_click();
      renderListings(renderListing_click);
    }
  });

  filterEl.addEventListener('keyup', function(e) {
    //Ture off 'click' so that the click result won't aprear
    //while input is back to empty
    click = false;
    if (clickId) {
      map.setFeatureState({
        source: 'stations',
        sourceLayer: source_layer,
        id: clickId
      }, {
        clickMain: false
      });
    }
    clickId = null;

    value = e.target.value;
    //value = normalize(e.target.value);

    //turn off click results
    all_id_r.forEach(function(id){
      map.setFeatureState({
        source: 'routes',
        sourceLayer: source_layer_2,
        id: id
      }, {
        click: false
      });
    });
    all_id.forEach(function(id){
      map.setFeatureState({
        source: 'stations',
        sourceLayer: source_layer,
        id: id
      }, {
        click: false
      });
    });

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
