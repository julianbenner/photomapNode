module.exports = {
  token: 'pk.eyJ1IjoianVsaWFuYmVubmVyIiwiYSI6Imo3VGM4QVkifQ.69vtm3yG3cQWalRZM0tdYA',

  imagePath: 'image',

  initial: {
    lat: 50,
    lon: 8,
    zoom: 7
  },
  rasterSize: function (zoom) {
    return 250 / Math.pow(2, zoom);
  },
  circleSize: function (imageCount) {
    return (Math.log(imageCount) + 5) * 7;
  }
};