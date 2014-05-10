var express = require('express');
var router = express.Router();
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

//search
var searchByLocation = function(req, res) {
    //console.log('hi');
    // set DB variable
    var db = req.db;
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
    var collection = db.get('location');   
    var response = "";

    // submit and update to DB: store in order {longitude, latitude}
    //TODO batch update
    //var result_output = null;
    //User 1:
    if (userId1) {
        collection.update(
    		{ _id : userId1 },
    		{ gps : {
    				type : "Point",
    				coordinates : [
    					parseFloat(user1Long),
    					parseFloat(user1Lat)
    				]}
    		},
    		{ upsert : true},
        	function (err, doc) {
            if (err) {
    			console.log(err);
                res.send({result:'error', message: "There was a problem adding/updating user 1 ID and/or GPS to the database.", err: err});
            }
            else {
    			//result = {result:'success', id : userId1, lat : user1Lat, long : user1Long};
                //debug
                console.log("result:'success' " + "id " + userId1 + " lat " + user1Lat + " long :" + user1Long);
    			response += 'success ';
            }
        });
    }
    //User 2:
    if (userId2) {
        collection.update(
    		{ _id : userId2 },
    		{ gps : {
    				type : "Point",
    				coordinates : [
    					parseFloat(user2Long),
    					parseFloat(user2Lat)
    				]}
    		},
    		{ upsert : true},
        	function (err, doc) {
            if (err) {
    			console.log(err);
                res.write({result:'error', message: "There was a problem adding/updating user 2 ID and/or GPS to the database.", err: err});
            }
            else {
    			//result = {result:'success', id : userId2, lat : user2Lat, long : user2Long};
                //console.log(result);
                //debug
                console.log("result:'success' " + "id " + userId2 + " lat " + user2Lat + " long :" + user2Long);  
                response += 'success ';  			
            }
        });        
        
    }
    //User 3:
    if (userId3) {
        collection.update(
    		{ _id : userId3 },
    		{ gps : {
    				type : "Point",
    				coordinates : [
    					parseFloat(user3Long),
    					parseFloat(user3Lat)
    				]}
    		},
    		{ upsert : true},
        	function (err, doc) {
            if (err) {
    			console.log(err);
                res.send({result:'error', message: "There was a problem adding/updating user 3 ID and/or GPS to the database.", err: err});
            }
            else {
    			//result = {result:'success', id : userId3, lat : user3Lat, long : user3Long};
                //console.log(result);
                //debug
                console.log("result:'success' " + "id " + userId3 + " lat " + user3Lat + " long :" + user3Long);
                response += 'success ';
            }
        });
    }
    
    //TODO this should construct list of all GPS lat and long values.
    var listLat = [user1Lat, user2Lat, user3Lat];
    var listLong = [user1Long, user2Long, user3Long];
    var listUserId = [userId1, userId2, userId3];
    console.log(listLat);
    console.log(listLong);
    //add markers to map
    //setLocationMarkers(listLat, listLong, listUserId);
    
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
            //res.send(response + JSON.stringify(data));
            res.send(listLat.splice(listLong).splice(listUserId));
        
    });
};

//parse JSON data returned by Yelp search API and render to UI
var parseYelpSearchResults = function(data) {        
    var map = L.map('map').setView([37.7756, -122.4193], 13);
    
    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
        
    if (data.businesses) {
        data.businesses.forEach(function(item, index) {
          console.log("id: " + item.id + " name: " + item.name + " rating: " + item.rating + " url: " + item.url);
          console.log(index);
          // add a marker in the given location, attach some popup content to it and open the popup
          L.marker([37.7756, -122.4193]).addTo(map)
              .bindPopup('Your current location!')
              .openPopup();  
        });
    }

    

      
}


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














var getInfoFromDoc = function(doc) {
	var result = [];
	for (var i = 0; i < doc.length; i++){
		result.push({ 			
		  id: doc[i]._id,
		  latitude: doc[i].gps.coordinates[1],		//GeoJSON in mongoDB stores in order {long, lat}; show in order {lat, long}
		  longitude: doc[i].gps.coordinates[0]
		});
	}	
	return result;
};




// //map stuff
// var showMap = function(doc) {
//     
// }
// 















//calculate Haversine distance (d) between a destination point and a source point if radius is provided.
//return boolean true/false if Haversine distance is within provided radius
var isWithinHaversine = function(sourceLat, sourceLong, radius, destLat, destLong) {
    var isWithinRadius = false;
    var R = 6371000; //avg earth radius in meters (radius param is in m)
    var radSourceLat = sourceLat * Math.PI / 180;
    var radDestLat = destLat * Math.PI / 180;
    var radDeltaLat = (destLat - sourceLat) * Math.PI / 180;
    var radDeltaLong = (destLong - sourceLong) * Math.PI / 180;
    
    var a = Math.sin(radDeltaLat/2) * Math.sin(radDeltaLat/2) + Math.cos(radSourceLat) * Math.cos(radDestLat) * Math.sin(radDeltaLong/2) * Math.sin(radDeltaLong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;  
    console.log("d: " + d);
    if (d <= radius) {
        isWithinRadius = true;  //d within radius
    }
    return isWithinRadius;
}

var filterByHaversine = function(doc, lat, long, radius) {
	var result = [];
	for (var i = 0; i < doc.length; i++){
        if (isWithinHaversine(lat, long, radius, doc[i].gps.coordinates[1], doc[i].gps.coordinates[0])) {
    		result.push({ 			
    		  id: doc[i]._id,
    		  latitude: doc[i].gps.coordinates[1],		//GeoJSON in mongoDB stores in order {long, lat}; show in order {lat, long}
    		  longitude: doc[i].gps.coordinates[0]
    		});
        }
    }	
	return result;
};

var searchnearestcabs = function(req, res) {
    // set DB variable 
    var db = req.db;
	var collection = db.get('location');
    var lat = req.query.latitude;
	var long = req.query.longitude;
	var radius = req.query.radius;
	var id = req.params.id;
    var limit = req.query.maxRecords;
	var criteria = {};
	if (id) {
		//get cab by id
		criteria = { _id : id };
	} else {
		//get nearest cab(s) to GPS location
		if (!lat ^ !long) {
			res.send({result:'error', message:'both latitude and longitude are required when one is provided'});
		}
	    if (lat && long) {
	 		criteria = 
			{ gps : 
				{ $nearSphere : 
					[parseFloat(long) , parseFloat(lat)] 	
				}
			};			
		   if (radius) {
			   criteria.gps.$maxDistance = parseFloat(radius);
		   }	
		}
	}
	var options = {};
	if (limit) {
		options.limit = parseInt(limit);
	} else {
	    //default value for limit is 8
        options.limit = 8;
	}
	collection.find(
		criteria, 
		options,
		function (err, doc) {
        if (err) {
            res.send({result:'error', message: "error occurred when querying a cab by id or finding nearest cabs by GPS location."});
			console.log(err);
        } else {
            if (!radius) {
                res.send(getInfoFromDoc(doc));
            } else {
                //filter by Haversine 
                res.send(filterByHaversine(doc, lat, long, radius));
            }
        }
    });
	
};

/* GET search nearest cabs */
router.get('/cabs', searchnearestcabs);
router.get('/cabs/:id', searchnearestcabs);

var deletecabs = function(req, res) {	
	var db = req.db;
	var collection = db.get('location');
	var id = req.params.id;
	var criteria = {};
	if (id) {
		criteria = { _id : id };
	}
	collection.remove(criteria, {},
 		function(err, doc) {
			if (err) {		
				console.log(err);
				res.send({result:'error', message: 'error occurred when deleting a cab by id or all cabs'});
			} else if (doc.size() == 0) {
			
			}else {
				console.log('successfully deleted all cabs');
				res.send({result:'success', message: 'successfully deleted a cab by id or all cabs'});
			}
 	});
};

/* DELETE delete a cab by id or all cabs */
router.delete('/cabs', deletecabs);
router.delete('/cabs/:id', deletecabs);

module.exports = router;
