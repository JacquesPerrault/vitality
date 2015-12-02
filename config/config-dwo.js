// config.js
module.exports = {
  'appInfo' : {
    "applicationId"     : "2f2461fa-8997-4fbe-847a-0c543901f654",
  	"applicationSecret" : "2332c6cc364772c96d78a413839f083f70a8cad2",
  	"applicationRoute"  : "dwotrends.mybluemix.net",
    'session'           : 'JcbAObLA0HySiXB8968dlAU'
  },
  'auth' : {
    'authorizationURL'  : 'https://github.com/login/oauth/authorize',
    'tokenURL'          : 'https://github.com/login/oauth/access_token',
    'clientID'          : '',
    'clientSecret'      : '',
    'clientToken'	    : '9854b1db0f5967552849bf5972d4d64ea11430a4',
    'callbackURL'       : 'http://dwotrends.mybluemix.net/auth/dwo/callback',
    'state'             : 'mzDs84jI9SfUrjrEwkC8fVO',
    'requestTokenURL'   : 'https://github.com/login/oauth/access_token',
    'verifyURL'         : '',
    'host'              : 'github.com'
  },
    'couch': {
    'db'                : 'dwopen',
    'host'              : 'http://localhost:5984'
  },
  "VCAP_SERVICES": {
    "sqldb" : [
      {
        "credentials" : {
          "connectionLimit"   : 1,
          "port"              : 3306,
          "db"                : "dwopen",
          "username"          : "user06682",
          "host"              : "64.207.156.238",
          "hostname"          : "64.207.156.238",
          "password"          : "y8cHd13~"
        }
      }
    ]
  }
};
