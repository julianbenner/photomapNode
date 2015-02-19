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

function draw_raster_block(lat_min, lat_max, lon_min, lon_max) {
	var image_count = 0;
	var avg_lon = (lon_min + lon_max) / 2;
	var avg_lat = (lat_min + lat_max) / 2;
	var lat_min = lat_min;
	var lat_max = lat_max;
	var lon_min = lon_min;
	var lon_max = lon_max;
	$.getJSON("get_image_count/" + lat_min + "," + lat_max + "," + lon_min + "," + lon_max, {}).
	success(function(data) {
		// iterate result (consisting of image_count and average position)
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
			$('.image_count').last().attr("data-toggle", "modal").attr("data-target", "#myModal").click(function() {
				$.getJSON("get_image_list/" + lat_min + "," + lat_max + "," + lon_min + "," + lon_max, {}).
				success(function(data2) {
					$('#gallery-view').html($.param(data2));
				});
			});
		}
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
			lat_min = raster[a][b][0];
			lat_max = raster[a][b][1];
			lon_min = raster[a][b][2];
			lon_max = raster[a][b][3];
			// asynchronous function, parameters applied at the bottom
			draw_raster_block(raster[a][b][0], raster[a][b][2], raster[a][b][1], raster[a][b][3]);
		}
	}
}