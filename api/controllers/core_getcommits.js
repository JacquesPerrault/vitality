var Promise     = require('promise');
var rp          = require('request-promise');
var config      = appConfig;

module.exports = {
        getcommits: getcommits
}



function getCommits(org, token, count) {
  var deferred = new Promise(function(resolve, reject) {
    var accessToken = (useAuth == true) ? "&access_token=" + token : '';
    var uri = "https://api.github.com/repos/" + org + '/commits'
      + "?client_id=" + config.auth.clientID
      + "&client_secret=" + config.auth.clientSecret
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
      var dateArr = new Array();
      var countArr = new Array();
      if (result.length === undefined) {
       reject({ 'error': {'message': 'Unable to retrieve commit counts from ' + org}, 'response': {'statusCode': 142}}); // <--- happens LATER (event that Promise.all listens for) 
      } else {
        console.log('---GOT RESULTS');
        // create an empty array for the past 12 months
        // this saves us the trouble of sorting and filling in blanks later
        var date = Date.now();
        var onemonth = 31*24*60*60*1000;
        for (i = 0; i<12; i++) {
          var month     = new Date(date).getMonth()+1;
          var year      = new Date(date).getWeekYear();
          var monthYear = month + '/' + year;
          dateArr.push(monthYear);
          countArr.push(0);
          date = date - onemonth;
        }
        dateArr.reverse();
        countArr.reverse();
        for (item in result) {
          var UTC       = Date.parse(result[item].commit.author.date);
          var total     = 1;
          var month     = new Date(UTC).getMonth()+1;
          var year      = new Date(UTC).getWeekYear();
          var monthYear = month + '/' + year;
          if (dateArr.indexOf(monthYear) === -1) {
            dateArr.push(monthYear);
            countArr.push(total);
          } else {
            countArr[dateArr.indexOf(monthYear)] += total;
          }
        }
        var retVal = new Array();
        // if count = 0, return all data
        // if count > available data, return all available data
        var months = count > 0 ? count : dateArr.length;
        months = months > dateArr.length ? dateArr.length : months;
        for (i = 0; i < months; i++ ) {
          var data = {}
          data.month = dateArr[dateArr.length-i-1];
          data.total = countArr[countArr.length-i-1];
          retVal.push(data);
        }
        resolve(retVal); // <--- happens LATER (event that Promise.all listens for)
      }
    })
    .catch(function (reason) {
      reject({ 'error': {'message': 'Unable to retrieve commit counts from ' + org}, 'response': {'statusCode': 143}}); // <--- happens LATER (event that Promise.all listens for) 
    })
  });
  return deferred; // <--- happens IMMEDIATELY (object that Promise.all listens on)
}


function getcommits(req, res) {
  console.log('=====================================');
  console.log('GET COMMIT DETAILS  =================');
  console.log('=====================================');
  var callback = req.swagger.params.callback.value;
  if (typeof callback === 'undefined') callback = 'callback' + Date.now();
  var count   = req.swagger.params.count.value || 6; // 0 indicates return all data, 6 is the default
  var token   = (useAuth === true) ? req.session.passport.user.user.token : "abcde"; // end user oauth token
  var id      = encodeURIComponent(req.swagger.params.id.value);
  var repo    = {};

  for (i=0; i < allrepos.length; i++) {
    console.log('--- SEARCHING: ' + allrepos[i].id);
    if (allrepos[i].id == id) {
      repo = allrepos[i];
      console.log('--- FOUND: ' + repo.full_name);
      break;
    }
  }

  if (repo.hasOwnProperty('id')) {
    Promise.resolve(getCommits(repo.full_name, token, count)
      .then (function (result) {
        var retVal = {};
        retVal.success = true;
        retVal.data = result;
        console.log('---SENDING: ' + JSON.stringify(retVal));
        res.status(200).jsonp(JSON.stringify(retVal));
      })
      .catch(function (reason) {
        var error = {'success': false, 'message': 'openWorks has encountered an error while retrieving repository commit information from GitHub.', 'code': 141, 'nativemessage': reason.error.message, 'nativecode': reason.response.statusCode };
        console.log('---ERROR:' + JSON.stringify(error));
        res.status(200).jsonp(JSON.stringify(error));
      })
    )
  } else {
    var error = {'success': false, 'message': 'No repository with that ID could be found.', 'code': 140 };
    console.log('---ERROR:' + JSON.stringify(error));
    res.status(200).jsonp(JSON.stringify(error));
  }

}
