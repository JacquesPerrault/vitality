module.exports = {
        getcommitsbyrepo: getcommitsbyrepo
}

function getcommitsbyrepo(req, res) {
  console.log('=====================================');
  console.log('GET COMMITS BY REPO AND DATE ========');
  console.log('=====================================');

  var callback = req.swagger.params.callback.value;
  if (typeof callback === 'undefined') callback = 'callback' + Date.now();
  var token   = (useAuth === true) ? req.session.passport.user.user.token : "abcde"; // end user oauth token

  if (allrepos.length === 0 ) {
    var error = {'success': false, 'message': 'Please load repository data first.', 'code': 220 };
    res.status(200).jsonp(JSON.stringify(error));
  } else {
    var query = '';
    var promise = new Promise(function (resolve, reject) {
      query = 'SELECT a.reponame AS "group" FROM commits a, committers b WHERE DATE(date) >= DATE_SUB(CURRENT_DATE,INTERVAL 4 WEEK) AND a.name=b.name GROUP BY a.reponame ORDER BY COUNT(a.name) DESC LIMIT 8';
      pool.query(query, function(err, result) {
        if (err) reject(err);
        else resolve(result);
      })
    })
    .then(function(result){
        tmpArr = [];
        for (var i=0; i < result.length; i++) {
          tmpArr.push(result[i].group);
        }
      var promise = new Promise(function (resolve, reject) {
        query = 'SELECT COUNT(a.name) AS y, DATE(a.date) AS x, a.reponame AS "group" FROM commits a, committers b WHERE a.reponame IN (' + pool.escape(tmpArr) + ') AND a.name=b.name GROUP BY a.reponame, DATE(a.date) ORDER BY a.date ASC';
        pool.query(query, function(err, result) {
          if (err) reject(err);
          else resolve(result);
        })
      })
      .then(function(result){
        var retVal = {};
        retVal.success = true;
        retVal.data = result;
        res.status(200).jsonp(JSON.stringify(retVal));
      })
      .catch(function (reason) {
        var error = {'success': false, 'message': 'Error: GET COMMIT TOTALS BY REPO AND DATE', 'code': 221, 'nativemessage': reason.error.message, 'nativecode': reason.response.statusCode };
        reject(reason);
        res.status(200).jsonp(JSON.stringify(error));
      })
    }).catch(function(reason){
      var error = {'success': false, 'message': 'Error: GET COMMIT TOTALS BY REPO AND DATE', 'code': 222, 'nativemessage': reason.message, 'nativecode': reason.code };
      res.status(200).jsonp(JSON.stringify(error));
    })
  }
};