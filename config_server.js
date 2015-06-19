module.exports = {
  // Port for the server to run
  port: '8080',

  // HTTPS creates a small overhead on delay. However, without encryption your password will be sent in plain text.
  // We recommend 'http' as httpPackage without HTTPS and 'spdy' as httpPackage with HTTPS. 'http2' as HTTPS package
  // might be preferable, but currently, there is a bug preventing its usage with Express.js. Don't forget to install
  // the according package with NPM (spdy is preinstalled).
  useHttps: false,
  httpPackage: 'http',

  // Key and certificate when using HTTPS
  keyFile: 'key.pem',
  certFile: 'cert.pem',

  // Change this. Used for token encryption
  secret: 'geheim',

  // Token lifetime (time until automatic logout) in milliseconds
  tokenLifetime: 60*60*1000,

  // Configure database here
  imageTableName: 'photomap_image',
  userTableName: 'photomap_user',
  dbConnection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'banane',
    database: 'photomap',
    dateStrings: true // Please do not change or remove this
  },

  // Only needs to be changed if you want a specific folder structure
  imagePath: 'images',
  cachePath: 'cache',
  tempPath: 'tmp',

  hashIterations: 1000
};
