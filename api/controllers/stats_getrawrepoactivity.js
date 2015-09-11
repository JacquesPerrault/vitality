module.exports = {
        getrawrepoactivity: getrawrepoactivity
}

function getrawrepoactivity(req, res) {
  console.log('=====================================');
  console.log('GET REPO ACTIVITY DATA ==============');
  console.log('=====================================');

  var callback = req.swagger.params.callback.value;
  if (typeof callback === 'undefined') callback = 'callback' + Date.now();
  var token   = (useAuth === true) ? req.session.passport.user.user.token : "abcde"; // end user oauth token
  var repo    = decodeURIComponent(req.query.repo);

  if (allrepos.length === 0 ) {
    var error = {'success': false, 'message': 'Please load repository data first.', 'code': 190 };
    res.send(200, callback + '(\'' + JSON.stringify(error) + '\')');
  } else {
    var whereclause = '';
    if (repo != 'undefined') {  // typeof no good here, will always be a string...
      whereclause = 'WHERE reponame IN (' + pool.escape(repo.split(',')) + ')';
    }
    var query = 'SELECT * FROM repoactivity ' + whereclause + ' ORDER BY reponame ASC, created ASC';
    console.log(query);
    var promise = new Promise(function (resolve, reject) {
      pool.query(query, function(err, result) {
        if (err) reject(err);
        else resolve(result);
      })
    }).then(function(result){
      var retVal = {};
      retVal.success = true;
      retVal.data = result;
      res.status(200).jsonp(JSON.stringify(retVal));
    }).catch(function(reason){
      var error = {'success': false, 'message': 'Unable to retrieve repo activity data.', 'code': 191, 'nativemessage': reason.message, 'nativecode': reason.code };
      res.status(200).jsonp(JSON.stringify(error));
    })
  }
};