var Promise     = require('promise');
var rp          = require('request-promise');
var config      = appConfig;

module.exports = {
        getaggregateactivity: getaggregateactivity
}



function _getaggregatecommits() {
  var deferred = new Promise(function(resolve, reject) {
    var query = '';
    query = 'SELECT COUNT(a.name) AS commits, DATE(a.date) AS date FROM commits a, committers b WHERE a.name=b.name GROUP BY DATE(a.date) ORDER BY a.date ASC';
    pool.query(query, function(err, result) {
      if (err) reject(err);
      else resolve(result);
    })
  });
  return deferred; // <--- happens IMMEDIATELY (object that Promise.all listens on)
}



function getaggregateactivity(req, res) {
  console.log('=====================================');
  console.log('GET AGGREGATE ACTIVITY ==============');
  console.log('=====================================');
  var callback = req.swagger.params.callback.value;
  if (typeof callback === 'undefined') callback = 'callback' + Date.now();
  if (allrepos.length === 0 ) {
    var error = {'success': false, 'message': 'Please load repository data first.', 'code': 250 };
    res.status(200).jsonp(JSON.stringify(error));
  } else {
    Promise.resolve(_getaggregatecommits()
      .then (function (result) {
        var data                = {};
        var total_projects      = allrepos.length + 1;
        var total_contributors  = 0;
        var total_forks         = 0;
        var total_pull_requests = 0;

        for (repo in allrepos) {
          total_contributors  += allrepos[repo].contributors_count;
          total_forks         += allrepos[repo].forks_count;
          total_pull_requests += allrepos[repo].pull_count;
        };
        data.commits              = result;
        data.total_projects       = total_projects;
        data.total_contributors   = total_contributors;
        data.total_forks          = total_forks;
        data.total_pull_requests  = total_pull_requests;

        var retVal = {};
        retVal.success = true;
        retVal.data = data;
        res.status(200).jsonp(JSON.stringify(retVal));
      })
      .catch(function (reason) {
        var error = {'success': false, 'message': 'An error was encountered while retrieving aggregate activity data.', 'code': 251, 'nativemessage': reason.error.message, 'nativecode': reason.response.statusCode };
        console.log('---ERROR:' + JSON.stringify(error));
        res.status(200).jsonp(JSON.stringify(error));
      })
    );
  }
}
