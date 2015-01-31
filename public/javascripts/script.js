var token = 'pk.eyJ1IjoianVsaWFuYmVubmVyIiwiYSI6Imo3VGM4QVkifQ.69vtm3yG3cQWalRZM0tdYA';

var map = L.map('map').setView([48.7,9.05],12);

var gl = L.mapboxGL({ accessToken: token, style: 'https://www.mapbox.com/mapbox-gl-styles/styles/bright-v6.json'}).addTo(map);

map.on('moveend', function (e) {
    marker_array.forEach(function (item) {
        map.removeLayer(item);
    });
    show_circles(map);
});