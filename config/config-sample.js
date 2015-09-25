// config.js
module.exports = {
  'appInfo' : {
    "applicationId"     : "[BlueMix Application ID]",
  	"applicationSecret" : "[BlueMix Application Secret]]",
  	"applicationRoute"  : "[BlueMix Application Route]",
    'session'           : '[session hash for express]'
  },
  'auth' : {
    'authorizationURL'  : 'https://github.com/login/oauth/authorize',
    'tokenURL'          : 'https://github.com/login/oauth/access_token',
    'clientID'          : '[GitHub client/app ID]]',
    'clientSecret'      : '[GitHub client/app Secret]',
    'callbackURL'       : '[OAuth callback URL]',
    'state'             : '[state hash for passport]]',
    'requestTokenURL'   : 'https://github.com/login/oauth/access_token',
    'verifyURL'         : '',
    'host'              : 'github.com'
  },
    'couch': {
    'db'                : 'vitality',
    'host'              : 'http://localhost:5984'
  },
  "VCAP_SERVICES": {
    "sqldb" : [
      {
        "credentials" : {
          "connectionLimit"   : 1,
          "port"              : 3306,
          "db"                : "[database name]",
          "username"          : "[database user]",
          "host"              : "[database ip or hostname]",
          "hostname"          : "[database hostname]",
          "password"          : "[database password]"
        }
      }
    ]
  }
};
