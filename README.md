# OpenLayers with Vector Tiles and Cloud Optimized Tiffs (COG)

## [www.opendem.info/bathymetryviewer_cog.html](https://www.opendem.info/bathymetryviewer_cog.html)

To get rid of backend components (database, mapservers, web application containers) modern geodata formats like Vector Tiles and Cloud Optimized Tiffs (COG) were tested.

Bathymetry COG is a derived product from the [GEBCO 2021 Grid](https://www.gebco.net/data_and_products/gridded_bathymetry_data/), made with [NaturalEarth](https://www.naturalearthdata.com/).

Marine labels and countries were made with [NaturalEarth](https://www.naturalearthdata.com/).

## Cloud Optimized Tiffs (COG)

The COG used has one band with a colour palette. Unfortunately, this was not used out of the box.

The use of style expression with 'match' leads to artefacts at the edges of the classification (image below).

![expression match](images/match_renderer.png)

Figure 1: Rendering the image with a match expression

This is why the style expression 'interpolate' was used here.

![expression interpolate](images/interpolate.png)

Figure 2: Rendering the image with a interpolate expression

In the higher zoom levels, most of it looks very smooth, but there are also artefacts like in Figure 2. In this case, I would have preferred the pixelated display to better reflect the spatial resolution.

Both style expressions are available in main.js for testing.

## Vector Tiles - Countries

Vector tiles were made with [GDAL](https://gdal.org). Have a look at the [OpenDEMsearcher GitHub Repo](https://github.com/OpenDEM/OpenDEMsearcher) for more information about Vector Tile processing.

## Vector Tiles - Contour lines with labels

At the higher zoom levels vector tiles were used with labels along the lines.
Unfortunately, the labels are not rendered in all regions.

![vector tile labels](images/vt_labels.png)

Only level 11 was processed for the contour lines to save hard disc space.
However, the geometries also match the display in the WMS in the larger zoom levels.

## GeoJson - Marine Areas Labels

Out-of-the-box labels of polygon GeoJson layers are only rendered at the centre of the polygon. A polygon to point conversion for a GeoJson layer has now simply been carried out here to save resources. The scale was taken into account during rendering.

## Conclusion

Compared to backend-based standard services, modern technologies without a backend may not be quite as advanced, but they have great potential.

The map client can be compared directly with the standard WMS applications:

* [Bathymetry Viewer Raster](https://opendem.info/bathymetryviewerraster.html)
* [Bathymetry Viewer Vector](https://opendem.info/bathymetryviewervector.html)
