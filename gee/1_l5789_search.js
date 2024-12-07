1// author: xin luo
// create: 2020.11.25
// des: search the landsat images


/////////////////////////////////////////////////////////////////
var bands_vis = ['SR_B5', 'SR_B4', 'SR_B3']   // landsat 9
// var bands_vis = ['B5', 'B4', 'B3']   // landsat 8
// var bands_vis = ['B3', 'B2', 'B1']       // landsat 5,7

var region = ee.Geometry.Rectangle(99, 74.15, 100.8, 74.6) // (lon_min,lat_min,lon_max,lat_max)
// the area may be appropriate in 2,00,000,000-4,000,000,000
print('scene area:', region.area())

/// Landsat 578 images
var start_time = '2024-5-25'
var end_time = '2024-12-21'

// ----- Landsat 578 images selection ----- 
// var img_col = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
// var img_col = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
// var img_col = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
var img_col = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
  .filter(ee.Filter.lt('CLOUD_COVER_LAND', 30))
  .filter(ee.Filter.gt('CLOUD_COVER_LAND', 0))
  .filterBounds(region)
  .filterDate(start_time, end_time);

// ----- Ensure the landsat image fully contain the training region. ----- 
var condition = function(image){
    var footprint = ee.Geometry(image.get('system:footprint'))
    var condition = ee.Geometry.Polygon(footprint.coordinates()).contains(region)
    return ee.Algorithms.If(condition, 
                            image.set('data', 'true'), 
                            ee.Image([]).set('data', 'false'))};

var img_sel = img_col.map(condition).filterMetadata('data', 'equals','true')
print(img_sel)

// ---- specific landsat image selection ---- 
var image = img_sel.first().clip(region)
// var image = ee.Image('LANDSAT/LE07/C01/T1_SR/LE07_175044_20000325')
            // .clip(region)
print(image)


// ---- visualization: outline and selection image ---- 
Map.centerObject(region, 9);
var empty = ee.Image().byte();
var scene_outline = empty.paint({
    featureCollection: region, color: 1, width: 3});

Map.addLayer(image, {bands: bands_vis, min:0, max:20000}, 'Landsat 9');
// Map.addLayer(img_col, {bands: bands_vis, min:0, max:20000}, 'Landsat 9 collection');
Map.addLayer(scene_outline, {palette: '#FFFF00'}, 'scene_outline')



