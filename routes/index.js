var express = require('express');
var router = express.Router();
var http = require('http');
var yelp = require("yelp").createClient({
  consumer_key: "9vGW7CCOVIDyECMs25QtlA", 
  consumer_secret: "9Bu0-7__h71X8QkC_CneYIS50PM",
  token: "veQm2kqJkxnIqGflovco3B8LThjO0WRo",
  token_secret: "D3E492AgNLGRDyKsJms0926QDug"
});

/* GET homepage */
router.get('/', function(req, res) {
  res.render('index', { title: 'Meetup' });
});

//TODO need global IP
//find IP address of current machine
/* var os = require('os');
var ifaces = os.networkInterfaces();
var ip = "";
for (var dev in ifaces) {
  var alias = 0;
  ifaces[dev].forEach(function(details) {
    if (details.family == 'IPv4') {
      console.log(dev+(alias?':'+alias:''), details.address);
      console.log('here');
      console.log(dev);
      console.log(details);
      console.log(details.address);
      ip = details.address;
      ++alias;
    }
  });
}

console.log("ip: " + ip);

//get current location based on IP address of current machine
var options = {
        host: 'freegeoip.net',    
        path: '/json/'  + ip,
        method: 'GET'   
};

var req = http.request(options, function(res) {    
    console.log('STATUS: ' + res.statusCode);    
    console.log('HEADERS: ' + JSON.stringify(res.headers));    
    res.setEncoding('utf8');    
    res.on('data', function (chunk) {   
        console.log('BODY: ' + chunk);
    });    
});

//write data to request body
req.write('data\n');
req.write('data\n');
req.end();

*/



//search
var searchByLocation = function(req, res) {
    //console.log('hi');
    // set DB variable
    //var db = req.db;
    // set variables
    var userId1 = req.body.user1id || req.params.user1id;
    var user1Lat = req.body.user1lat || req.params.user1lat;
    var user1Long = req.body.user1long || req.params.user1long;
    
    var userId2 = req.body.user2id || req.params.user2id;
    var user2Lat = req.body.user2lat || req.params.user2lat;
    var user2Long = req.body.user2long || req.params.user2long;
    
    var userId3 = req.body.user3id || req.params.user3id;
    var user3Lat = req.body.user3lat || req.params.user3lat;
    var user3Long = req.body.user3long || req.params.user3long;
    
    //console.log("userId, userLat, userLong : " + userId + " " + userLat + " " + userLong);
    
	if (!userId1 && !userId2 && !userId3) { 
		res.send({result:'error', message:'at least 1 userId is required!!'}
	)};

    // set db collection
    //var collection = db.get('location');   
    var response = "";
    
    //TODO this should construct list of all GPS lat and long values.
    var listLat = [user1Lat, user2Lat, user3Lat];
    var listLong = [user1Long, user2Long, user3Long];
    var listUserId = [userId1, userId2, userId3];
    console.log(listLat);
    console.log(listLong);
    
    //find geographic midpoint of GPS points
    var midpoint = getGeographicMidpoint(listLat, listLong);
    console.log(midpoint[0] + " " + midpoint[1]);   

    //query Yelp with search term
    var term = req.body.term || req.params.term;
    var limit = 10; //limit to 10 for now
    console.log("my search term: " + term);
    var loc = midpoint[0] + "," + midpoint[1];
    console.log(loc);
    yelp.search({term: term, ll: loc, limit: parseInt(limit)}, 
        function(error, data) {
            if (error) {
                console.log('ERROR in yelp.search: ' + error);
            }
            console.log(listLat);
            console.log(listLong);
            console.log(listUserId);
            //console.log(response + JSON.stringify(data));
            //parse Yelp results
            res.send(parseYelpSearchResults(data));
    });
};


/* POST and PUT go to add cab */
router.put('/searchByLocation', searchByLocation);
router.put('/searchByLocation/:inputTerm', searchByLocation);
router.post('/searchByLocation', searchByLocation);
router.post('/searchByLocation/:inputTerm', searchByLocation);

//finds geographic midpoint of n GPS points
var getGeographicMidpoint = function(listLat, listLong) {
   // console.log('here');
    if (listLat.length != listLong.length) {
        console.log('ERROR in getGeographicMidpoint: listLat and listLong must be same length!');
        return 'ERROR in getGeographicMidpoint: listLat and listLong must be same length!';
    }
    //console.log('here 2');
    var numPoints = listLat.length;
    console.log(numPoints);
    //cartesian coordinates:
    var x = 0;
    var y = 0;
    var z = 0;
    
    //convert lat and long to float, radians
    for (var i=0; i<numPoints; i++) {
     //   console.log('here 3 ' + listLat[i] + " " + listLong[i]);
        var lat = parseFloat(listLat[i]);
    //    console.log(lat);
        var long = parseFloat(listLong[i]);
  //      console.log(long);
        lat = lat * Math.PI / 180;        
        long = long * Math.PI / 180;
        x += Math.cos(lat) * Math.cos(long);
        y += Math.cos(lat) * Math.sin(long);
        z += Math.sin(lat);
    }
    
    //avg:
    var avg_x = parseFloat(x/numPoints);
    var avg_y = parseFloat(y/numPoints);
    var avg_z = parseFloat(z/numPoints);
    //console.log('avg_x ' + avg_x + 'avg_y' + avg_y + 'avg_z' + avg_z);
    var midLong = Math.atan2(y, x) * 180 / Math.PI;  //convert back to degrees
    var midLat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))) * 180 / Math.PI;    //convert back to degrees
    return [midLat, midLong];   // in order {lat, long}
}

//parse JSON data returned by Yelp search API
//TODO filter by isOpen
var parseYelpSearchResults = function(data) {  
    var results = []; 
    if (data.businesses) {
        data.businesses.forEach(function(item, index) {
          console.log("id: " + item.id + " name: " + item.name + " rating: " + item.rating + " url: " + item.url);
          console.log(index);
          //hashmap: K, V -> field name, value
          var map = {}; 
          map['name'] = item.name;
          map['url'] = item.url;
          map['image_url'] = item.image_url;
          map['rating'] = item.rating;
          map['review_count'] = item.review_count;
          map['location'] = item.location;
          results.push(map);
        });
    }
    return results;     
}

module.exports = router;
