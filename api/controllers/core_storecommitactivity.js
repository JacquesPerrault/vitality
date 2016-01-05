var Promise         = require('promise');
var rp              = require('request-promise');

module.exports = {
        storecommitactivity: storecommitactivity
}

function getCommitDetails(org, token, repoid) {
  var deferred = new Promise(function(resolve, reject) {
    var accessToken = (useAuth == true) ? "&access_token=" + token : '';
    var uri = "https://api.github.com/repos/" + org + '/commits'
      + accessToken
      + '&per_page=100';
    var options = {
      url: uri,
      qs: {
        access_token: gittoken
      },
      simple: false,
      headers: {
          'User-Agent': 'OpenWorks',
          'Content-Type': 'application/json'
      },
      json: true
    }
    //console.log('--- URI: ' + uri);
    rp(options)
    .then(function (result) {
      console.log(JSON.stringify(result));
      var retVal = new Array();
      if (result.length === undefined) {
       reject({ 'error': {'message': 'Unable to retrieve commit details from ' + org}, 'response': {'statusCode': 172}}); // <--- happens LATER (event that Promise.all listens for) 
      } else {
        for (item in result) {
          var commitInfo      = {};
          commitInfo.sha      = result[item].sha;
          commitInfo.name     = result[item].commit.author.name;
          commitInfo.email    = result[item].commit.author.email;
          commitInfo.date     = result[item].commit.author.date;
          commitInfo.repoid   = repoid;
          commitInfo.reponame = org;
          retVal.push(commitInfo);
        }
        resolve(retVal); // <--- happens LATER (event that Promise.all listens for)
      }
    })
    .catch(function (reason) {
      reject({ 'error': {'message': 'Unable to retrieve commit details from ' + org}, 'response': {'statusCode': 173}}); // <--- happens LATER (event that Promise.all listens for) 
    })
  });
  return deferred; // <--- happens IMMEDIATELY (object that Promise.all listens on)
}


function storecommitactivity(req, res) {
  console.log('=====================================');
  console.log('STORE COMMIT ACTIVITY  ==============');
  console.log('=====================================');

  var callback = req.swagger.params.callback.value;
  if (typeof callback === 'undefined') callback = 'callback' + Date.now();
  var token   = (useAuth === true) ? req.session.passport.user.user.token : "abcde"; // end user oauth token
  var repo    = {};

  if (allrepos.length === 0 ) {
    var error = {'success': false, 'message': 'Please load repository data first.', 'code': 170 };
    res.status(200).jsonp(JSON.stringify(error));
  } else {
    var commitdetailsPromises = [];
    for (var i = 0, len = allrepos.length; i < len; i++) {
      commitdetailsPromises.push(getCommitDetails(allrepos[i].full_name, token, allrepos[i].id));
    }

    Promise.all(commitdetailsPromises)
    .then(function (dataArr) {

      if (dataArr.length > 0) {
        // sample string for DB2
/*          ibmdb.open(odbc_string, function (err,conn) {
          if (err) return console.log(err);
          conn.query('select * from commits', function (err, data) {
            if (err) console.log(err);
            else console.log(data);

            conn.close(function () {
              console.log('done');
            });
          });
        })*/

        var count       = 0;
        // get the timestamp of the most recent update
        var promise = new Promise(function (resolve, reject) {
          pool.query('SELECT created from commits order by created DESC limit 1', function(err, rows, fields) {
            if (err) reject(err);
            else resolve(rows);
          })
        }).then(function(rows) {
            var lastUpdate = 0;
            if (rows.length > 0) lastUpdate = Date.parse(rows[0].created);
            return lastUpdate;
        }).then(function(date) {
          // iterate through the commit details
          for (i in dataArr) {
            for (j in dataArr[i]) {
              if (Date.parse(dataArr[i][j].date) > date) {
                var query = 'INSERT INTO commits (sha, name, email, date, repoid, reponame) VALUES (' +
                    '"' + dataArr[i][j].sha + '",' +
                    '"' + dataArr[i][j].name + '",' +
                    '"' + dataArr[i][j].email + '",' +
                    '"' + dataArr[i][j].date + '",' +
                    dataArr[i][j].repoid + ',' +
                    '"' + dataArr[i][j].reponame + '")';
                console.log('---QUERY: ' + query);
                var promise = new Promise(function (resolve, reject) {
                  pool.query(query, function(err, result) {
                    if (err) reject(err);
                    else resolve(result);
                  })
                }).catch(function(reason){
                  var error = {'success': false, 'message': 'Unable to update commit details.', 'code': 174, 'nativemessage': reason.message, 'nativecode': reason.code };
                  res.status(200).jsonp(JSON.stringify(error));
                })
              }
            }
          }
        }).then(function(){
          var retVal = {};
          retVal.success = true;
          res.status(200).jsonp(JSON.stringify(retVal));
        }).catch(function(reason){
          var error = {'success': false, 'message': 'Unable to update commit details.', 'code': 175, 'nativemessage': reason.message, 'nativecode': reason.code };
          res.status(200).jsonp(JSON.stringify(error));
        });
      }
    })
    .catch(function (reason) {
        var error = {'success': false, 'message': 'openWorks has encountered an error while retrieving commit details from GitHub.', 'code': 171, 'nativemessage': reason.error.message, 'nativecode': reason.response.statusCode };
        reject(reason);
        res.status(200).jsonp(JSON.stringify(error));
    });
  }
}
