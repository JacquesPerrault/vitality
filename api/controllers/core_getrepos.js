module.exports = {
        getrepos: getrepos
}

function getrepos(req, res) {
  console.log('=====================================');
  console.log('GET REPOS ===========================');
  console.log('=====================================');
  var callback = req.swagger.params.callback.value;
  if (typeof callback === 'undefined') callback = 'callback' + Date.now();
  if (allrepos.length === 0 ) {
    var error = {'success': false, 'message': 'Please load repository data first.', 'code': 120 };
    res.status(200).jsonp(JSON.stringify(error));
  } else {
    var retVal = {};
    retVal.success = true;
    retVal.data = allrepos;
    res.status(200).jsonp(JSON.stringify(retVal));
  }
}