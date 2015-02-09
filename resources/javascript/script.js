var token = 'pk.eyJ1IjoianVsaWFuYmVubmVyIiwiYSI6Imo3VGM4QVkifQ.69vtm3yG3cQWalRZM0tdYA';

var map = L.map('map').setView([48.7, 9.05], 12);

var gl = L.mapboxGL({
	accessToken: token,
	style: 'https://www.mapbox.com/mapbox-gl-styles/styles/bright-v6.json'
}).addTo(map);

map.on('moveend', function(e) {
	marker_array.forEach(function(item) {
		map.removeLayer(item);
	});
	show_circles(map);
});

marker_array = [];

function show_circle(lat, lon, text, size) {
	return L.marker([lat, lon], {
		icon: L.divIcon({
			html: '<div class="image_count_child">' + text + '</div>',
			iconSize: [size, size],
			className: 'image_count'
		})
	});
}

function show_circles() {
	raster_hor = 5;
	raster_ver = 5;
	bounds = map.getBounds();
	map_lat_min = bounds._southWest.lat;
	map_lon_min = bounds._southWest.lng;
	map_lat_max = bounds._northEast.lat;
	map_lon_max = bounds._northEast.lng;
	raster_hor_size = (map_lon_max - map_lon_min) / raster_hor;
	raster_ver_size = (map_lat_max - map_lat_min) / raster_ver;

	raster = [];

	// lon_min -> lon_max
	for (a = 0; a < raster_hor; a++) {
		raster[a] = [];
		// lat_min -> lat_max
		for (b = 0; b < raster_ver; b++) {
			raster[a][b] = [map_lat_min + raster_ver_size * b, map_lon_min + raster_hor_size * a, map_lat_min + raster_ver_size * (b + 1), map_lon_min + raster_hor_size * (a + 1)];
			v0 = raster[a][b][0];
			v1 = raster[a][b][1];
			v2 = raster[a][b][2];
			v3 = raster[a][b][3];
			// asynchronous function, parameters applied at the bottom
			(function(v0, v1, v2, v3) {
				image_count = 0;
				avg_lon = (v2 + v3) / 2;
				avg_lat = (v0 + v1) / 2;
				$.getJSON("get_image_count/" + v0 + "," + v1 + "," + v2 + "," + v3, {}).
				success(function(data) {
					$.each(data, function(key, val) {
						if (key == 'image_count') {
							image_count = val;
						} else if (image_count > 0) {
							if (key == 'avg_lat') {
								avg_lat = (val * 3 + avg_lat) / 4;
							} else if (key == 'avg_lon') {
								avg_lon = (val * 3 + avg_lon) / 4;
							}
						}
					});
					if (image_count > 0) {
						var circleMarker = show_circle(avg_lat, avg_lon, image_count, (Math.log(image_count) + 5) * 7);
						marker_array.push(circleMarker);
						circleMarker.addTo(map);
					}
				});
			})(raster[a][b][0], raster[a][b][2], raster[a][b][1], raster[a][b][3]);
		}
	}
}