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
`swagger project start`

## DOCUMENTATION
`swagger project edit`

## CONSUMING
All endpoints should be called as shown below:

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
