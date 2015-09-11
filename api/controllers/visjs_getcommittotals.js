module.exports = {
        getcommittotals: getcommittotals
}

function getcommittotals(req, res) {
  console.log('=====================================');
  console.log('GET COMMIT TOTALS ===================');
  console.log('=====================================');

  var callback = req.swagger.params.callback.value;
  if (typeof callback === 'undefined') callback = 'callback' + Date.now();
  var token   = (useAuth === true) ? req.session.passport.user.user.token : "abcde"; // end user oauth token

  if (allrepos.length === 0 ) {
    var error = {'success': false, 'message': 'Please load repository data first.', 'code': 210 };
    res.status(200).jsonp(JSON.stringify(error));
  } else {
      var query = 'SELECT COUNT(a.name) AS y, DATE(a.date) AS x, b.ibm AS "group" FROM commits a, committers b WHERE a.name=b.name GROUP BY b.ibm, DATE(a.date) ORDER BY a.date ASC';
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
        var error = {'success': false, 'message': 'Unable to retrieve commit counts.', 'code': 211, 'nativemessage': reason.message, 'nativecode': reason.code };
        res.status(200).jsonp(JSON.stringify(error));
      })
  }
};