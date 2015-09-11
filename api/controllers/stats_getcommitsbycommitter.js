module.exports = {
        getcommitsbycommitter: getcommitsbycommitter
}

function getcommitsbycommitter(req, res) {
  console.log('=====================================');
  console.log('GET COMMITS BY COMMITTER ============');
  console.log('=====================================');

  var callback = req.swagger.params.callback.value;
  if (typeof callback === 'undefined') callback = 'callback' + Date.now();
  var token   = (useAuth === true) ? req.session.passport.user.user.token : "abcde"; // end user oauth token

  if (allrepos.length === 0 ) {
    var error = {'success': false, 'message': 'Please load repository data first.', 'code': 205 };
    res.status(200).jsonp(JSON.stringify(error));
  } else {
      var query = 'SELECT b.name, b.ibm, a.reponame, a.date FROM commits a, committers b, email_addresses c WHERE a.email=c.email AND c.oneid=b.oneid AND b.oneid=b.committerid ORDER BY b.name, a.date ASC';
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
        var error = {'success': false, 'message': 'Unable to retrieve commiter data.', 'code': 206, 'nativemessage': reason.message, 'nativecode': reason.code };
        res.status(200).jsonp(JSON.stringify(error));
      })
  }
};