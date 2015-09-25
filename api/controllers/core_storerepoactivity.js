var Promise     = require('promise');

module.exports = {
        storerepoactivity: storerepoactivity
}

function storerepoactivity(req, res) {
  console.log('=====================================');
  console.log('STORE REPO ACTIVITY =================');
  console.log('=====================================');

  var callback = req.swagger.params.callback.value;
  if (typeof callback === 'undefined') callback = 'callback' + Date.now();
  var token   = (useAuth === true) ? req.session.passport.user.user.token : "abcde"; // end user oauth token
  var repo    = {};

  if (allrepos.length === 0 ) {
    var error = {'success': false, 'message': 'Please load repository data first.', 'code': 180 };
    res.send(200, callback + '(\'' + JSON.stringify(error) + '\')');
  } else {
    for (i in allrepos) {
      var query = 'INSERT INTO repoactivity (repoid, reponame, open_issues, forks, stargazers, watchers) VALUES (' +
          allrepos[i].id + ',' +
          '"' + allrepos[i].full_name + '",' +
          (allrepos[i].open_issues_count || 0) + ',' +
          allrepos[i].forks_count + ',' +
          allrepos[i].stargazers_count + ',' +
          allrepos[i].watchers_count + ')';
      console.log('---QUERY: ' + query);
      var promise = new Promise(function (resolve, reject) {
        pool.query(query, function(err, result) {
          if (err) reject(err);
          else resolve(result);
        })
      }).then(function(){
        var retVal = {};
        retVal.success = true;
        res.status(200).jsonp(JSON.stringify(retVal));
      }).catch(function(reason){
        var error = {'success': false, 'message': 'Unable to update repo activity.', 'code': 181, 'nativemessage': reason.message, 'nativecode': reason.code };
        res.status(200).jsonp(JSON.stringify(error));
      })
    }
  }
};