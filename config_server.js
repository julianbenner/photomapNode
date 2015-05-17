module.exports = {
  keyFile: 'key.pem',
  certFile: 'cert.pem',

  secret: 'geheim',
  tokenLifetime: 60*60*1000,

  databaseName: 'photomap_image',
  dbConnection: {
    host: '10.8.0.1',
    port: 33061,
    user: 'banane',
    password: 'banane',
    database: 'photomap'
  },

  imagePath: 'images',
  cachePath: 'cache',
  tempPath: 'tmp',

  hashIterations: 1000
};