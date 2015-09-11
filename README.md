# Open Source Vitality

## INSTALLING
```
git clone https://github.com/JacquesPerrault/vitality.git
git remote add upstream https://github.com/JacquesPerrault/vitality.git
git pull upstream master
npm install -g swagger
npm install
```

## RUNNING 
**Before** you run for the first time

1. Create a copy of `/public/javascript/orgs-sample.js`, then add projects using the format in the sample file.  GitHub orgs **will not work** at this time.
2. Create a copy of `/config/config-sample.js`, then replace the values in square brackets [] with actual values.
3. Modify the `appConfig` and `orgs` variables in `server.js` to point at the files you created in steps 1 & 2.
4. Create and initialize the database **(instructions TBD)**
5. **remote hosts only** Modify the `host` attribute in `/swagger/api/swagger.yaml` to point at the host (name or ip) serving the API
6. Execute the following at the command line: `swagger project start`

## DOCUMENTATION
You can view and modify documentation by entering the following at the command line: `swagger project edit`

## CONSUMING
Vitality supports cross-domain requests.  The code below demonstrates how to make a cross domain requests using jQuery:

``` javascript
var callback = function(data) {  
  data = $.parseJSON(data);
  if (data.success) {
    $.each(data, function (i, d) {  
      // do something with the data(d)  
    }  
  } else {
    errorcallback(data)
  }
)}    
var errorcallback = function(error) {  
  // handle the error  
  return false;  
}   
var url = 'whatever.endpoint.you.want';  
var jqxhr = $.ajax({  
  url: url,  
  dataType: "jsonp",  
  crossDomain: true,  
  data: '',  
  success: callback
})
```

The Vitality API will *always* return a status code of 200.  
It is up to the developer to check the value of the `success` attribute of the response object to test for success or failure.  
Refer to the endpoint documentation for details.

## TO CREATE A NEW FEATURE/FIX
```
git stash
git pull upstream master
git checkout -b meaningful-name-of-branch
git stash pop
git add -p
git commit -m "meaningful message"
git push -u origin meaningful-name-of-branch   (-u is only needed the first time)
```
Then create a new Pull Request pointing at the branch to be merged.