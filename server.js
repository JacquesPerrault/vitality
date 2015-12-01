/*jshint node:true*/

// serverjs
// This file contains the server side JavaScript code for your application.

// global variables
allrepos            = [];
useAuth             = false;
useCouch            = true;
useSQL              = false;
passport            = require('passport'); // Authentication

// CHANGE THIS TO POINT AT YOUR CONFIG AND ORG FILES
appConfig       = require('./config/config-sample');
orgs            = require('./public/javascript/orgs-sample'); // list of projects to track


var flash           = require('connect-flash');
var express         = require('express'),
  bodyparser        = require('body-parser'),
  namespace         = require('express-namespace'),
  ibmbluemix        = require('ibmbluemix'),
  http              = require('http'),
  moment            = require('moment');
var app             = express();
var methodOverride  = require('method-override');
var session         = require('express-session');
var cookieParser    = require('cookie-parser');
var path            = require('path');
var DateTime        = require('date-time-string'); // data/time formatting
var cfenv           = require('cfenv');
var SwaggerExpress  = require('swagger-express-mw');
var mysql           = require('mysql');
var appEnv          = cfenv.getAppEnv();
var nano            = require('nano')(appConfig.couch.host);
var usePassport     = false;

// set the token for GitHub queries
if ((appConfig.auth.clientToken === '') && (appConfig.auth.clientID === '') && (appConfig.auth.clientSecret === '') ) {
  console.log('---: GitHub credentials not provided.  You MUST provide a personal access token or a registered application id/secret.')
  process.exit();
}

if ((appConfig.auth.clientToken === '') && ((conappConfigfig.auth.clientID === '') || (appConfig.auth.clientSecret === '') )) {
  console.log('---: Incomplete GitHub credentials not provided.  You MUST provide a personal access token or a registered application id/secret.')
  process.exit();
}

if ((appConfig.auth.clientID != '') && (appConfig.auth.clientSecret != '')){
  gittoken = '?client_id=' + appConfig.auth.clientID + '&client_secret=' + appConfig.auth.clientSecret;
  //console.log('---: Using REGISTERED APPLICATION credentials');
}
else {
  gittoken = '?access_token=' + appConfig.auth.clientToken;
  //console.log('---: Using PERSONAL ACCESSS token');
}

// INITIALIZE COUCHDB
var db_name = appConfig.couch.db;
var db = nano.use(db_name);

nano.db.list(function(err, body) {
  console.log('--- COUCHDB: LIST OF DATABASES: ' + body);
});
function check_db(tried) {
  nano.db.get(db_name, function (err,body) {
    if(err) {
      if(err.message === 'no_db_file'  && tried < 1) {
        console.log('--- COUCHDB: ' + db_name + ' does not exist - the database will be created.');
        // create database and retry
        return nano.db.create(db_name, function () {
          check_db(tried+1);
        });
      }
      else { return console.log(err); }
    }
    db = nano.use(db_name);
    // request all documents in database
    nano.request(
      { db  : db_name,
        path: '_all_docs'
      },
      // delete all documents in database
      function(err, docs) {
        var deleteDocs = [];
        docs.rows.forEach(function(doc) {
          var _doc      = {}
          _doc._id      = doc.id;
          _doc._rev     = doc.value.rev;
          _doc._deleted =true;
          deleteDocs.push(_doc);
        });
        var req_body = {};
        req_body.docs = deleteDocs;
        //console.log(req_body);  // these are the documents that will be deleted
        nano.request(
          { db    : db_name,
            path  : '_bulk_docs',
            method: 'post',
            body  : req_body
          });
      });
    nano.db.compact(db_name); // compact the db
    console.log(body); // list db info
  });
}

check_db(0);

// for mysql
pool = mysql.createPool({
  connectionLimit : 10,
  host     : appConfig.VCAP_SERVICES.sqldb[0].credentials.host,
  port     : appConfig.VCAP_SERVICES.sqldb[0].credentials.port,
  user     : appConfig.VCAP_SERVICES.sqldb[0].credentials.username,
  password : appConfig.VCAP_SERVICES.sqldb[0].credentials.password,
  database : appConfig.VCAP_SERVICES.sqldb[0].credentials.db
});

// for swagger
var config = {
  appRoot: __dirname // required config
};

//override default VCAP_SERVICES if the environment provides them
var dbms = appEnv.getService(/^SQL Database/);
if (dbms) {
  appConfig.VCAP_SERVICES = appEnv.getService(dbms);
}

//initialize the SDK
ibmbluemix.initialize(appConfig.appInfo);

// initialize BlueMix logging service
var logger = ibmbluemix.getLogger();

//initialize ibmconfig module
var ibmconfig = ibmbluemix.getConfig();
var port = (ibmconfig.getPort() || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');

// create an express app
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

// all environments
app.set('port', process.env.PORT || 3000);

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
//app.use(bodyparser.json());                         // parse application/json
//app.use(bodyarser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded
app.use(methodOverride());
app.use(cookieParser(appConfig.session));

if (usePassport) {
  // required for passport
  app.use(session({ secret: appConfig.appInfo.session, cookie: {maxAge: 82800000 }, saveUninitialized: true, resave: true })); // session secret, 23 hour lifetime
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session
}
//app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/javascript',express.static(path.join(__dirname, 'public/javascript')));
app.use('/stylesheets',express.static(path.join(__dirname, 'public/stylesheets')));

if (usePassport) require(path.join(__dirname, 'config/passport'))(passport); // pass passport for configuration

//var contextRoot = ibmconfig.getContextRoot();


// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
// TODO: Get service credentials and communicate with bluemix services.


require(path.join(__dirname, 'routes/routes.js'))(app, passport); // load our routes and pass in our app, config, and fully configured passport


function initData() {
  var options = {
    host: host,
    port: port,
    path: '/loadallrepos',
    method: 'GET'
  };

  console.log('Initializing openWorks API...')
  http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log(chunk);
    });
  }).end();
}

function storeCommitActivity() {
  var options = {
    host: host,
    port: port,
    path: '/storecommitactivity',
    method: 'GET'
  };

  console.log('Storing commit activity...')
  http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log(chunk);
    });
  }).end();
}

function storeRepoActivity() {
  var options = {
    host: host,
    port: port,
    path: '/storerepoactivity',
    method: 'GET'
  };

  console.log('Storing repo activity...')
  http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log(chunk);
    });
  }).end();
}


  // set timer for hourly refresh
  setInterval(function () {
    initData();
    console.log('---: Refreshed data at: ' + DateTime.toDateTimeString(Date.now()));
  }, 3600000);

/*
  // set timer for periodic commit stats collection
  setInterval(function () {
    storeCommitActivity();
    console.log('---: Commit activity updated at: ' + DateTime.toDateTimeString(Date.now()));
  }, 7200000);

  // set timer for periodic repo statistics collection
  setInterval(function () {
    storeRepoActivity();
    console.log('---: Repo activity updated at: ' + DateTime.toDateTimeString(Date.now()));
  }, 43200000);
*/


// Start server
SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);
 
  
  // Custom error handler that returns JSON
  app.use(function(err, req, res, next) {
    if (typeof err !== 'object') {
      // If the object is not an Error, create a representation that appears to be
      err = {
        message: String(err) // Coerce to string
      };
    } else {
      // Ensure that err.message is enumerable (It is not by default)
      Object.defineProperty(err, 'message', { enumerable: true });
    }

    // Return a JSON representation of #/definitions/ErrorResponse
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(err));
  });


  //app.listen(port, host);
  app.listen(port, host, initData);

  console.log('App started on port ' + port);
});


  // script for graceful shutdown
  process.on( 'SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    process.exit( );
  })
