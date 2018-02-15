// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var S3Adapter = require('parse-server').S3Adapter;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  // databaseURI: databaseUri || 'mongodb://admin:ingtelekto@localhost:27017/ing',
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'ingtelektoApp',
  masterKey: process.env.MASTER_KEY || 'ingtelektoApp2016', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'https://localhost/api',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  // filesAdapter: new S3Adapter(
  //   "AKIAJYBDRE5TQ4CQQPMQ",
  //   "IrGstAU+x7hBUDEscAA0C6KewUnESbuDBfKmckxH",
  //   "ingtelekto",
  //   {directAccess: true, bucketPrefix: 'images/'}
  // ),
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

// Parse Dashboard 
var options = { allowInsecureHTTP: true };
var dashboard = new ParseDashboard({
  // Parse Dashboard settings
  "apps": [
    {
      "serverURL": "https://localhost/api",
      "appId": "ingtelektoApp",
      "masterKey": "ingtelektoApp2016",
      "appName": "Ingtelekto"
    }
  ],
  "users": [
     {
       "user":"admin",
       "pass":"ingtelekto2016",
       "apps": [{"appId": "ingtelektoApp"}]
     }],
}, options);

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /api URL prefix
var mountPath = process.env.PARSE_MOUNT || '/api';
app.use(mountPath, api);


// Parse Dashboard available at /backoffice
app.use('/backoffice', dashboard);

// // Parse Server plays nicely with the rest of your web routes
// app.get('/', function(req, res) {
//   res.status(200).send('Aquí va a estar la aplicación web de Ingtelekto!!');
// });

// // There will be a test page available on the /test path of your server url
// // Remove this before launching your app
// app.get('/test', function(req, res) {
//   res.sendFile(path.join(__dirname, '/public/test.html'));
// });

// Rewrite rule for angularJs
// app.use('/app', express.static(__dirname + '/public/app'));
// app.use('/*', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/dist'));
app.get('/*', function(req, res){
    res.sendFile(__dirname + '/dist/index.html');
});

var port = process.env.PORT || 80;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
