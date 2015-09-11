# OPENworks API Documentation

## For developers
A basic UI is provided for the `/getallrepos` and `/showrepos` endpoints here: [endpoint testing](http://openworks-dev.mybluemix.net)

## List of endpoints
The current endpoint URL is `http://openworks-dev.mybluemix.net`

| Endpoint | Description |
| -------- | ----------- |
| [`/loadallrepos`](#loadallrepos) | Load/refresh all repository data into application memory
| [`/getrepos`](#getrepos) | Get all repositories
| [`/getrepobyid/:id`](#getrepobyid) | Get a specific repository, by ID
| [`/getcommits/:id`](#getcommitsbyid) | Get all commits for a repository, by ID

## <a name="endpointdocumentation"></a>Endpoint documentation
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

The openWorks API will *always* return a status code of 200.  
It is up to the developer to check the value of the `success` attribute of the response object to test for success or failure.  
Refer to the endpoint documentation, as well as the the [Error documentation](#errors) for details.

---
### <a name="loadallrepos"></a>Load/refresh all repository data into application memory
`/loadallrepos`

Loads specific information for all repositories monitored by [developerWorks Open](https://developer.ibm.com/open/) into the application state; forks are filtered out.
`/loadallrepos` is automatically called during server initialization.  Subsequent calls to `/loadallrepos` will refresh the data if it has been longer than one hour since the last refresh.  

**NOTE:** The back end will **not** refresh data unless [`/loadallrepos`](#loadallrepos) is explicitly called.

*Returns*

The number of milliseconds until the next available refresh, or an [error](#errors)

```
{  
  "success": true,  
  "nextrefresh": 2220000  
}  
```

see [`/getrepobyid/:id`](#getrepobyid) for a list of attributes loaded into application memory.

---
### <a name="getrepos"></a>Get all repositories
`/getallrepos`

This will return an array of objects with the same schema as `/getrepobyid/:id`

*Returns*

see [`/getrepobyid/:id`](#getrepobyid) for a list of attributes returned.

---
### <a name="getrepobyid"></a>Get a specific repository, by ID
`/getrepobyid/:id`

Where **:id** is any valid GitHub repository loaded through the `/loadallrepos` endpoint.

*Returns*

```
{  
  "success": true,  
  "id": 26492823,  
  "url": "https://api.github.com/repos/ibmjstart/wp-bluemix-objectstorage",  
  "created_at":"2014-09-26 14:32:04.000",
  "name": "wp-bluemix-objectstorage",  
  "full_name": "ibmjstart/wp-bluemix-objectstorage",  
  "description": "A WordPress plugin for storing media in IBM Object Storage service on Bluemix",  
  "language": "PHP",  
  "open_issues_count": 2,  
  "forks_count": 1,  
  "pull_count": 0,  
  "pushed_at": "2015-03-31 19:19:10.000",  
  "stargazers_count": 3  
  "watchers_count": 3  
  "contributors_count": 3  
  "release_count": 4
}  
```

| Attribute | Description |
| --------- | ----------- |
| id | The repo's' GitHub ID |
| url | The repo's GitHub API endpoint.  Used by the openWorks API |
| created_at | The repo's creation date |
| name | The repo's name |
| full_name | The repo's full name (include the name of its parent organization) |
| description | The repo's description, as appears on GitHub |
| language | The repo's programming language |
| open_issues_count | The number of open issues for this repo |
| forks_count | The number of forks for this repo |
| pull_count | The number of open Pull Requests for this repo |
| pushed_at | This is the most recent date of a PushEvent; for all intents and purposes, the "last modified" date |
| stargazers_count | The number of people who have "starred" (bookmarked) the repository.  Starring has no impact on notifications |
| watchers_count | The number of people who are watching the repository (receiving notifications)  |
| contributors_count | The number of people who have contributed to the repository |
| release_count | The number of releases.  This does not include draft releases, nor regular Git tags that have not been associated with a release |
| branch_count | The number of branches |


---
### <a name="getcommitsbyid"></a>Get all commits for a repository, by ID
`/getcommits/:id[?count=n]`

**:id** is any valid GitHub repository loaded through the `/loadallrepos` endpoint.  
**count** (optional) the number of months of data to return.  GitHub tracks the most recent 13 months of data.  The API will return six months of data by default.  If more data is requested than available, all available adta will be returned.

*Returns*

```
{
  "success": true,
  "data": [
    {"month":"6/2015","total":0},
    {"month":"5/2015","total":0},
    {"month":"4/2015","total":0},
    {"month":"3/2015","total":1},
    {"month":"2/2015","total":3}
  ]
}
```

---
## <a name="errors"></a>Error documentation

Please refer to the [Endpoint documentation](endpointdocumentation) for an example of how to call opwnWorks API endpoints.

When an error occurs within the openWorks API, an HTTP 200 status code will be returned to the client
along with an object containing a `success` attribute with a value of `false`.  It is up to the developer 
to decide how to handle the error, and should do so within the `errorcallback` function.  

The error object will *always* have the `success`, `message` and `code` attributes.  It may or may not have the other attributes;
developers should examine the object and handle them accordingly if present.

**Error object**

``` javascript
{
  "success": false,  
  "message": "openWorks has encountered an error while retrieving repository commit information from GitHub.",
  "code": 141,
  "nativemessage": "Unable to retrieve commit count from kimchi-project/kimchi",
  "nativecode": 142
}
```

