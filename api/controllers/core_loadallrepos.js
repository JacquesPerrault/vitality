var DateTime        = require('date-time-string'); // data/time formatting
var Promise         = require('promise');
var rp              = require('request-promise');

module.exports = {
        loadallrepos: loadallrepos
}

var refreshInterval = 3600000; // interval between data refesh, in milliseconds
var lastRefreshDate = Date.now() - refreshInterval;


function getRepo(org, token) {
  var deferred = new Promise(function(resolve, reject) {
    var orgName = org.name;
    var type = org.type;
    var accessToken = (useAuth == true) ? "&access_token=" + token : '';
    var data  = data || []; // interesting data that we persist
    var repos = repos || []; // all data from GitHub, transient
    var reposcmd = type === "repo" ? "" : "/repos";

    // These client tokens are for a dummy app, and there is no user specific information that we get, so
    // all in all, pretty safe to expose this here.

    // there are three supported request types: org, user and repo. Syntax differs.
    // org url:   https://api.github.com/orgs/:org
    // repo url:  https://api.github.com/repos/:owner/:repo
    // user url:  https://api.github.com/users/:username
    var uri = "https://api.github.com/"+type+"s/" + orgName + reposcmd
      + "?per_page=1000"
      + accessToken
      + "&client_id=" + appConfig.auth.clientID
      + "&client_secret=" + appConfig.auth.clientSecret
      + "&t=" + new Date().getTime();

    var options = {
      url: uri,
      headers: {
          'User-Agent': 'OpenWorks',
          'Content-Type': 'application/json'
      },
      json: true
    }

    rp(options)
    .then(function (result) {
      if (!Array.isArray(result)) {
        result = [].concat(result);
      }
      if (result && result.length > 0) {
        // iterate through each repo in the result set
        repos = repos.concat(result);
        for (repo in repos) {
          if ((repos[repo].fork === false) || (repos[repo].full_name === 'jasnell/activitystrea.ms')) {
            data.push({
              'id': repos[repo].id,
              'url': repos[repo].url,
              'html_url': repos[repo].html_url,
              'created_at': DateTime.toDateTimeString(new Date(repos[repo].created_at)),
              'name': repos[repo].name,
              'full_name': repos[repo].full_name,
              'description': '', //repos[repo].description.replace(/'/g, '&lsquo').replace(/"/g, '&quot'),
              'language': repos[repo].language || 'null',
              'open_issues_count': repos[repo].open_issues_count || 0,
              'forks_count': repos[repo].forks_count || 0,
              'stargazers_count': repos[repo].stargazers_count || 0,
              'watchers_count': repos[repo].subscribers_count || 0
            });
            //console.log('---REPO API URL:' + uri);

          } else {
            console.log('---IGNORING FORK: ' + JSON.stringify({'id': repos[repo].id, 'full_name': repos[repo].full_name, 'url': repos[repo].html_url}));
          }
        };

        // pre sort by how recently the repo was modified
 /*       data.sort(function (a, b) {
          if (a.pushed_at < b.pushed_at) return 1;
          if (b.pushed_at < a.pushed_at) return -1;
          return 0;
        });
*/
        data.sort(function (a, b) {
          if (a.name.toLowerCase() > b.name.toLowerCase()) {return 1;}
          if (b.name.toLowerCase() > a.name.toLowerCase()) {return -1};
          return 0;
        });

        resolve(data); // <--- happens LATER (event that Promise.all listens for)
      }
    })
    .catch(function (reason) {
      var error = {'message': 'openWorks has encountered an error while retrieving core repository data from GitHub.', 'code': 103, 'nativemessage': reason.error.message, 'nativecode': reason.response.statusCode };
    })
  });
  return deferred; // <--- happens IMMEDIATELY (object that Promise.all listens on)
}



function getPulls(pullUri, token, index) {
  var deferred = new Promise(function(resolve, reject) {
    var accessToken = (useAuth == true) ? "&access_token=" + token : '';
    var uri = pullUri
      + "?client_id=" + appConfig.auth.clientID
      + "&client_secret=" + appConfig.auth.clientSecret
      + accessToken;
    var options = {
      url: uri,
      headers: {
          'User-Agent': 'OpenWorks',
          'Content-Type': 'application/json'
      },
      json: true
    }

    rp(options)
    .then(function (result) {
      var data = {};
      data.pull_count = result.length || 0;
      data.index = index;
      resolve(data); // <--- happens LATER (event that Promise.all listens for)
    })
    .catch(function (reason) {
      reject({ 'error': {'message': 'Unable to retrieve pull count from ' + pullUri}, 'response': {'statusCode': 101}}); // <--- happens LATER (event that Promise.all listens for) 
    })
  });
  return deferred; // <--- happens IMMEDIATELY (object that Promise.all listens on)
}



function getLastModified(requestUri, token, index) {
  var deferred = new Promise(function(resolve, reject) {
    var accessToken = (useAuth == true) ? "&access_token=" + token : '';
    var uri = requestUri
      + "?client_id=" + appConfig.auth.clientID
      + "&client_secret=" + appConfig.auth.clientSecret
      + accessToken;
    var options = {
      url: uri,
      headers: {
          'User-Agent': 'OpenWorks',
          'Content-Type': 'application/json'
      },
      json: true
    }

    rp(options)
    .then(function (result) {
      var data = {};
      if (result && result.length > 0) {
        for (event in result) {
          if (result[event].type === "PushEvent") {
            var created_at = result[event].created_at;
            data.pushed_at = created_at !== 0 ? DateTime.toDateTimeString(new Date(created_at)) : 'null';
            data.index = index;
            break;
          }
        }
      }

      if (!data.hasOwnProperty('pushed_at')){
        data.pushed_at = '';
        data.index = index;
      }
      resolve(data); // <--- happens LATER (event that Promise.all listens for)
    })
    .catch(function (reason) {
      reject({ 'error': {'message': 'Unable to retrieve last modified date from ' + requestUri}, 'response': {'statusCode': 102}}); // <--- happens LATER (event that Promise.all listens for) 
    })
  });
  return deferred; // <--- happens IMMEDIATELY (object that Promise.all listens on)
}



function getReleaseCount(pullUri, token, index) {
  var deferred = new Promise(function(resolve, reject) {
    var accessToken = (useAuth == true) ? "&access_token=" + token : '';
    var uri = pullUri
      + "?client_id=" + appConfig.auth.clientID
      + "&client_secret=" + appConfig.auth.clientSecret
      + accessToken;
    var options = {
      url: uri,
      headers: {
          'User-Agent': 'OpenWorks',
          'Content-Type': 'application/json'
      },
      json: true
    }

    rp(options)
    .then(function (result) {
      var data = {};
      data.release_count = result.length || 0;
      data.index = index;
      resolve(data); // <--- happens LATER (event that Promise.all listens for)
    })
    .catch(function (reason) {
      reject({ 'error': {'message': 'Unable to retrieve release count from ' + pullUri}, 'response': {'statusCode': 103}}); // <--- happens LATER (event that Promise.all listens for) 
    })
  });
  return deferred; // <--- happens IMMEDIATELY (object that Promise.all listens on)
}



function getBranchCount(pullUri, token, index) {
  var deferred = new Promise(function(resolve, reject) {
    var accessToken = (useAuth == true) ? "&access_token=" + token : '';
    var uri = pullUri
      + "?client_id=" + appConfig.auth.clientID
      + "&client_secret=" + appConfig.auth.clientSecret
      + accessToken;
    var options = {
      url: uri,
      headers: {
          'User-Agent': 'OpenWorks',
          'Content-Type': 'application/json'
      },
      json: true
    }

    rp(options)
    .then(function (result) {
      var data = {};
      data.branch_count = result.length || 0;
      data.index = index;
      resolve(data); // <--- happens LATER (event that Promise.all listens for)
    })
    .catch(function (reason) {
      reject({ 'error': {'message': 'Unable to retrieve branch count from ' + pullUri}, 'response': {'statusCode': 104}}); // <--- happens LATER (event that Promise.all listens for) 
    })
  });
  return deferred; // <--- happens IMMEDIATELY (object that Promise.all listens on)
}



function getContributorsCount(org, token, index) {
  var deferred = new Promise(function(resolve, reject) {
    var accessToken = (useAuth == true) ? "&access_token=" + token : '';
    var uri = "https://api.github.com/repos/" + org + '/contributors'
      + "?client_id=" + appConfig.auth.clientID
      + "&client_secret=" + appConfig.auth.clientSecret
      + accessToken;
    var options = {
      url: uri,
      headers: {
          'User-Agent': 'OpenWorks',
          'Content-Type': 'application/json'
      },
      json: true
    }

    //console.log('--- URI: ' + uri);
    rp(options)
    .then(function (result) {
      var data = {};
      data.contributors_count = result.length || 0;
      data.index = index;
      resolve(data); // <--- happens LATER (event that Promise.all listens for)
    })
    .catch(function (reason) {
      reject({ 'error': {'message': 'Unable to retrieve contributors count from ' + org}, 'response': {'statusCode': 150}}); // <--- happens LATER (event that Promise.all listens for) 
    })
  });
  return deferred; // <--- happens IMMEDIATELY (object that Promise.all listens on)
}



// =====================================
// LOAD/REFRESH ALL REPOS ==============
// =====================================
function loadallrepos(req, res) {
  console.log('=====================================');
  console.log('LOAD/REFRESH ALL REPOS FROM GITHUB ==');
  console.log('=====================================');

  var callback = req.swagger.params.callback.value;
  if (typeof callback === 'undefined') callback = 'callback' + Date.now();
  var nextRefreshDate = refreshInterval - (Date.now() - lastRefreshDate);
  var token = (useAuth === true) ? req.session.passport.user.user.token : "abcde"; // end user oauth token
  var retVal = {};
  console.log('---USING SSO?: ' + useAuth);
  console.log('---TOKEN: ' + '?access_token=' + token);
  console.log('---RATE LIMIT: ' + 'https://api.github.com/rate_limit?client_id=' + appConfig.auth.clientID + '&client_secret=' + appConfig.auth.clientSecret);
  console.log('---LAST REFRESH: ' + DateTime.toDateTimeString(lastRefreshDate));
  console.log('---MINUTES TO NEXT REFRESH: ' + (nextRefreshDate ) / 1000 / 60);

  if (allrepos.length === 0 || nextRefreshDate < 0) {
    console.log('---REFRESHING DATA');
    var projects = orgs.projects; // get the list of entities being tracked
    var promises = []; // create an array to hold our promises

    projects.forEach(function (org) {
      promises.push(getRepo(org, token)); // <-- causes the promise to begin execution NOW
    });

    //------------------------------
    // get basic repository data
    //------------------------------
    Promise.all(promises) // <-- listens for promises to resolve or reject
    .then(function(dataArr) { // <-- happens once ALL promises resolve or reject
      allrepos = []; // flush the existing data
      dataArr.forEach(function(repoArr) {
        repoArr.forEach(function(repo) {
          allrepos.push(repo);
        })
      })
      return allrepos;

    //------------------------------
    // get repository pull counts
    //------------------------------
    }).then(function(repos) {
      var pullcountPromises = [];
      for (var i = 0, len = repos.length; i < len; i++) {
        pullcountPromises.push(getPulls(repos[i].url + '/pulls', token, i));
      }

      Promise.all(pullcountPromises)
      .then(function (dataArr) {
        for (var i = 0, len = dataArr.length; i < len; i++) {
          allrepos[dataArr[i].index].pull_count = dataArr[i].pull_count;
        }
      })
      .catch(function (reason) {
          var error = {'success': false, 'message': 'openWorks has encountered an error while retrieving data from GitHub.', 'code': 100, 'nativemessage': reason.error.message, 'nativecode': reason.response.statusCode };
          reject(reason);
          res.status(200).jsonp(JSON.stringify(error));
      });
      return allrepos;

    //------------------------------
    // get last modified date
    //------------------------------
    }).then(function(repos) {
      var lastmodifiedPromises = [];
      for (var i = 0, len = repos.length; i < len; i++) {
        lastmodifiedPromises.push(getLastModified(repos[i].url + '/events', token, i));
      }

      Promise.all(lastmodifiedPromises)
      .then(function (dataArr) {
        for (var i = 0, len = dataArr.length; i < len; i++) {
          allrepos[dataArr[i].index].pushed_at = dataArr[i].pushed_at;
        }
      })
      .catch(function (reason) {
          var error = {'success': false, 'message': 'openWorks has encountered an error while retrieving data from GitHub.', 'code': 100, 'nativemessage': reason.error.message, 'nativecode': reason.response.statusCode };
          reject(reason);
          res.status(200).jsonp(JSON.stringify(error));
      });
     return allrepos;

    //------------------------------
    // get release count
    //------------------------------
    }).then(function(repos) {
      var releasecountPromises = [];
      for (var i = 0, len = repos.length; i < len; i++) {
        releasecountPromises.push(getReleaseCount(repos[i].url + '/releases', token, i));
      }

      Promise.all(releasecountPromises)
      .then(function (dataArr) {
        for (var i = 0, len = dataArr.length; i < len; i++) {
          allrepos[dataArr[i].index].release_count = dataArr[i].release_count;
        }
      })
      .catch(function (reason) {
          var error = {'success': false, 'message': 'openWorks has encountered an error while retrieving data from GitHub.', 'code': 100, 'nativemessage': reason.error.message, 'nativecode': reason.response.statusCode };
          reject(reason);
          res.status(200).jsonp(JSON.stringify(error));
      });
     return allrepos;


    //------------------------------
    // get branch count
    //------------------------------
    }).then(function(repos) {
      var branchcountPromises = [];
      for (var i = 0, len = repos.length; i < len; i++) {
        branchcountPromises.push(getBranchCount(repos[i].url + '/branches', token, i));
      }

      Promise.all(branchcountPromises)
      .then(function (dataArr) {
        for (var i = 0, len = dataArr.length; i < len; i++) {
          allrepos[dataArr[i].index].branch_count = dataArr[i].branch_count;
        }
      })
      .catch(function (reason) {
          var error = {'success': false, 'message': 'openWorks has encountered an error while retrieving data from GitHub.', 'code': 100, 'nativemessage': reason.error.message, 'nativecode': reason.response.statusCode };
          reject(reason);
          res.status(200).jsonp(JSON.stringify(error));
      });
     return allrepos;

    //------------------------------
    // get contributors count
    //------------------------------
    }).then(function(repos) {
      var contributorscountPromises = [];
      for (var i = 0, len = repos.length; i < len; i++) {
        contributorscountPromises.push(getContributorsCount(repos[i].full_name, token, i));
      }

      Promise.all(contributorscountPromises)
      .then(function (dataArr) {
        //console.log(JSON.stringify(dataArr));
        for (var i = 0, len = dataArr.length; i < len; i++) {
          allrepos[dataArr[i].index].contributors_count = dataArr[i].contributors_count;
        }
      })
      .catch(function (reason) {
          var error = {'success': false, 'message': 'openWorks has encountered an error while retrieving data from GitHub.', 'code': 100, 'nativemessage': reason.error.message, 'nativecode': reason.response.statusCode };
          reject(reason);
          res.status(200).jsonp(JSON.stringify(error));
      });

      lastRefreshDate = Date.now();
      retVal.success = true;
      retVal.data = { 'nextrefresh': refreshInterval - (Date.now() - lastRefreshDate) };
      res.status(200).jsonp(JSON.stringify(retVal));
      console.log(JSON.stringify(retVal));

    //------------------------------
    // error handler for chained promises
    //------------------------------
    }).catch(function(reason) {
            var error = {'success': false, 'message': 'openWorks has encountered an error while retrieving data from GitHub.', 'code': 100, 'nativemessage': reason.error.message, 'nativecode': reason.response.statusCode };
            reject(reason);
            res.status(200).jsonp(JSON.stringify(error));
    })
  } else {
    retVal.success = true;
    retVal.data = { 'nextrefresh': nextRefreshDate };
    //res.status(200).send( callback + '(\'' + JSON.stringify(retVal) + '\')');
    res.status(200).jsonp(retVal);
    console.log(JSON.stringify(retVal));
  }
}