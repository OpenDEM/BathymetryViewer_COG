import './style.css';
import { Map, View } from 'ol';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { createXYZ } from 'ol/tilegrid';
import { transformExtent } from 'ol/proj';
import Overlay from 'ol/Overlay';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import GeoTIFF from 'ol/source/GeoTIFF';
import WebGLTileLayer from 'ol/layer/WebGLTile';
import { toStringHDMS } from 'ol/coordinate';
import { toLonLat } from 'ol/proj';
import { ScaleLine, Attribution, defaults as defaultControls, Control } from 'ol/control.js';


const attribution = new Attribution({
  collapsed: false
});

class HelpControl extends Control {
  constructor(opt_options) {
    const options = opt_options || {};
    const img = document.createElement('img');
    img.src = 'images/help.png';
    img.className = 'helpimage ol-unselectable ol-control';
    img.id = 'helpimage';
    super({
      element: img,
      target: options.target,
    });
    img.addEventListener('click', this.handleHelp.bind(this), false);
  }

  handleHelp() {
    if (document.getElementById("help").style.display === "none") {
      document.getElementById("help").style.display = "block";
      document.getElementById("helpimage").style.border = "solid 3px red";
    } else {
      document.getElementById("help").style.display = "none";
      document.getElementById("helpimage").style.border = "none";
    }
  }
}

var mapExtent = transformExtent([-180.000000, -90.00000, 180.000000, 90.000000], 'EPSG:4326', 'EPSG:3857');
var mapMinZoom = 0;
var mapMaxZoom = 10;

/* Styles */

/* label formarine areas geojson */

const labelStyle = new Style({
  stroke: new Stroke({
    color: 'red',
    width: 1,
  }),
  text: new Text({
    font: '16px Calibri,sans-serif',
    overflow: true,
    fill: new Fill({
      color: '#000',
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 3,
    }),
  }),
});

/* colors for cloud optimized geotiff */

var cogInterpolateColor = {
  color: [
    'case',
    ['==', ['band', 2], 255],
    '#00000000',
    [
      'interpolate',
      ['linear'],
      ['band', 1],
      0.0, 'rgb(255, 255, 255)',
      0.001, 'rgb(240, 255, 255)',
      0.037, 'rgb(219, 255, 255)',
      0.074, 'rgb(193, 247, 253)',
      0.111, 'rgb(166, 241, 252)',
      0.148, 'rgb(146, 223, 248)',
      0.222, 'rgb(130, 210, 245)',
      0.259, 'rgb(114, 198, 241)',
      0.296, 'rgb(99, 182, 236)',
      0.333, 'rgb(87, 163, 231)',
      0.370, 'rgb(78, 146, 224)',
      0.407, 'rgb(66, 131, 218)',
      0.444, 'rgb(58, 118, 211)',
      0.481, 'rgb(48, 103, 203)',
      0.518, 'rgb(40, 92, 193)',
      0.555, 'rgb(33, 79, 183)',
      0.593, 'rgb(28, 67, 170)',
      0.63, 'rgb(22, 57, 157)',
      0.666, 'rgb(18, 46, 143)',
      0.704, 'rgb(13, 36, 127)',
      0.741, 'rgb(9, 27, 110)',
      0.777, 'rgb(5, 18, 88)',
      0.815, 'rgb(2, 12, 68))',
      0.852, 'rgb(0, 5, 48)',
      0.888, 'rgb(0, 5, 37)',
      0.926, 'rgb(0, 5, 32)',
      0.963, 'rgb(0, 5, 21)',
      1.0, 'rgb(0, 0, 0)',
    ]]
};


/* if you want to use this, set normalize: false in the sourceCOG */

var cogCaseColor = {

  // case used here for transparency alpha channel
  color: [
    'case',
    ['==', ['band', 2], 0],
    '#00000000',
    ['match', ['band', 1],
      1, 'rgb(240, 255, 255)',
      2, 'rgb(219, 255, 255)',
      3, 'rgb(193, 247, 253)',
      4, 'rgb(166, 241, 252)',
      5, 'rgb(146, 223, 248)',
      6, 'rgb(130, 210, 245)',
      7, 'rgb(114, 198, 241)',
      8, 'rgb(99, 182, 236)',
      9, 'rgb(87, 163, 231)',
      10, 'rgb(78, 146, 224)',
      11, 'rgb(66, 131, 218)',
      12, 'rgb(58, 118, 211)',
      13, 'rgb(48, 103, 203)',
      14, 'rgb(40, 92, 193)',
      15, 'rgb(33, 79, 183)',
      16, 'rgb(28, 67, 170)',
      17, 'rgb(22, 57, 157)',
      18, 'rgb(18, 46, 143)',
      19, 'rgb(13, 36, 127)',
      20, 'rgb(9, 27, 110)',
      21, 'rgb(5, 18, 88)',
      22, 'rgb(2, 12, 68))',
      23, 'rgb(0, 5, 48)',
      24, 'rgb(0, 5, 37)',
      25, 'rgb(0, 5, 32)',
      26, 'rgb(0, 5, 21)',
      27, 'rgb(0, 0, 0)',
      'rgb(0, 0, 0)'
    ]
  ]
};

/* Contour lines with labeling */
/* two color dashed line */
var lightStroke = new Style({
  stroke: new Stroke({
    color: [255, 255, 255, 0.6],
    width: 2,
    lineDash: [4, 8],
    lineDashOffset: 6
  })
});

var darkStroke = new Style({
  stroke: new Stroke({
    color: [0, 0, 0, 0.6],
    width: 2,
    lineDash: [4, 8]
  })
});

var layerStyles = function (feature, resolution) {
  return [
    lightStroke,
    darkStroke,
    new Style({
      text: new Text({
        text: feature.getProperties().DEPTH.toString(),
        font: ' 12pt sans-serif',
        fill: new Fill({ color: '#000000ff' }),
        stroke: new Stroke({ color: '#ffffffff', width: 3.0 }),
        overflow: 'true',
        //maxAngle: 360,
        placement: 'line'
      })
    })
  ]
};

/* color for mvt countries */

const region = new Style({
  stroke: new Stroke({
    color: 'black',
    width: 1,
  }),
  fill: new Fill({
    color: 'rgba(111,111,111,0.3)',
  }),
});


/* Layers */

/* GeoJson Layers for labels of marine areas
Rendering is scale dependend */

var namesJson = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: 'https://www.opendem.info//bathymetryviewer_cog/labels_points.geojson'
  }),
  style: function (feature) {
    let zoom = map.getView().getZoom();
    zoom = zoom - 2;
    if (zoom < 0) {
      zoom = 0;
    }
    const labelscale = feature.get('scalerank');
    if (zoom >= labelscale) {
      const label = feature.get('label');
      labelStyle.getText().setText(label);
      return labelStyle;
    }
  }
});

/* Layer cloud optimizes geotiff */

const sourceCOG = new GeoTIFF({
  // normalized data vof the image from 0-1
  // for case this must be commented in
  // normalize: false,
  sources: [
    {
      nodata: 255,
      url: 'https://www.opendem.info//bathymetryviewer_cog/gebco_3857_cog.tif',
      min: 0,
      max: 27
    }
  ]
});

const COG = new WebGLTileLayer({
  nodata: 0,
  source: sourceCOG,
  style: cogInterpolateColor
  //style: cogCaseColor
});


// vector tile layer for countries
var countriesLayer = new VectorTileLayer({
  className: 'countriesLayer',
  declutter: true,
  source: new VectorTileSource({
    attributions: ', made with <a target="_blank" href="https://www.naturalearthdata.com/">Natural Earth</a>.',
    format: new MVT(),
    tileGrid: createXYZ({
      minZoom: mapMinZoom,
      maxZoom: mapMaxZoom,
      tileSize: 512,
    }),
    tilePixelRatio: 8,
    url: "https://www.opendem.info//bathymetryviewer_cog/v_countries/{z}/{x}/{y}.pbf",
  }),
  extent: mapExtent,
  style: region
});

var contourLayer = new VectorTileLayer({
  className: 'contourLayer',
  declutter: true,
  source: new VectorTileSource({
    attributions: ' Derived product from the <a href="https://www.gebco.net/data_and_products/gridded_bathymetry_data/">GEBCO 2021 Grid</a>, made with <a href="https://www.naturalearthdata.com/">NaturalEarth</a> by OpenDEM',
    format: new MVT(),
    tileGrid: createXYZ({
      minZoom: 0,
      maxZoom: 11,
      tileSize: 512,
    }),
    tilePixelRatio: 8,
    url: "https://www.opendem.info/bathymetryviewer_cog/v_contours/{z}/{x}/{y}.pbf",
  }),
  extent: mapExtent,
  style: layerStyles

});



const map = new Map({
  target: 'map',
  controls: defaultControls({ attribution: false }).extend([attribution,
    new ScaleLine(),
    new HelpControl()
  ]),
  layers: [COG, contourLayer, countriesLayer, namesJson],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

// Popup
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById("popup-closer");

var overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  },
});

closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};
map.addOverlay(overlay);

map.on("singleclick", (evt) => {
  const pixel = map.getEventPixel(evt.originalEvent);
  const gl = COG.getRenderer().helper.getGL();
  const pixelData = new Uint8Array(4);
  gl.readPixels(pixel[0], pixel[1], 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);
  console.log(pixelData);
  var classi = COG.getData(evt.pixel);
  console.log(classi);

  let palette = classi[0];
  let depthclass;

  // normalized values 0-255

  switch (palette) {
    case 9:
      depthclass = "< 25m"
      break;
    case 18:
      depthclass = "25-50m"
      break;
    case 28:
      depthclass = "50-100m"
      break;
    case 37:
      depthclass = "100-250m"
      break;
    case 47:
      depthclass = "250-500m"
      break;
    case 55:
      depthclass = "500-750m"
      break;
    case 66:
      depthclass = "750-1000m"
      break;
    case 75:
      depthclass = "1000-1250m"
      break;
    case 85:
      depthclass = "1250-1500m"
      break;
    case 94:
      depthclass = "1500-1750m"
      break;
    case 103:
      depthclass = "1750-2000m"
      break;
    case 113:
      depthclass = "2000-2500m"
      break;
    case 122:
      depthclass = "2500-3000m"
      break;
    case 132:
      depthclass = "3000-3500m"
      break;
    case 141:
      depthclass = "3500-4000m"
      break;
    case 151:
      depthclass = "4000-4500m"
      break;
    case 160:
      depthclass = "4500-5000m"
      break;
    case 170:
      depthclass = "5000-5500m"
      break;
    case 179:
      depthclass = "5500-6000m"
      break;
    case 188:
      depthclass = "6000-6500m"
      break;
    case 198:
      depthclass = "6500-7000m"
      break;
    case 207:
      depthclass = "7000-7500m"
      break;
    case 217:
      depthclass = "7500-8000m"
      break;
    case 226:
      depthclass = "8000-8500m"
      break;
    case 236:
      depthclass = "8500-9000m"
      break;
    case 245:
      depthclass = "9000-9500m"
      break;
    case 255:
      depthclass = "< -9500m"
      break;
    default:
      depthclass = "noData"
  }

  var coordinate = evt.coordinate;
  var hdms = toStringHDMS(toLonLat(coordinate));

  content.innerHTML = '<p>Depth class: ' + depthclass + ', at coodinate:</p><code>' + hdms + '</code>';
  if (evt.coordinate[1] >= 0) {
    document.getElementById('popup').className = 'ol-popup-bottom';
  } else {
    document.getElementById('popup').className = 'ol-popup';
  }
  overlay.setPosition(evt.coordinate);
});
