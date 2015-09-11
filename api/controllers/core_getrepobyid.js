module.exports = {
        getrepobyid: getrepobyid
}



function getrepobyid(req, res) {
  console.log('=====================================');
  console.log('GET REPO BY ID ======================');
  console.log('=====================================');

  var callback = req.swagger.params.callback.value;
  if (typeof callback === 'undefined') callback = 'callback' + Date.now();
  var id      = encodeURIComponent(req.swagger.params.id.value);
  var data = {};

  for (i=0; i < allrepos.length; i++) {
    if (allrepos[i].id == id) {
      data = allrepos[i];
      break;
    }
  }

  if (data.hasOwnProperty('id')) {
    var retVal = {};
    retVal.success = true;
    retVal.data = data;
    console.log('---SENDING: ' + JSON.stringify(retVal));
    res.status(200).jsonp(JSON.stringify(retVal));
  }
  else {
    var error = {'success': false, 'message': 'No repository with that ID could be found.', 'code': 130 };
    res.status(200).jsonp(JSON.stringify(error));
  }
}
