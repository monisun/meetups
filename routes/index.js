var express = require('express');
var router = express.Router();

/* GET homepage */
router.get('/', function(req, res) {
  res.render('index', { title: 'Meetup' });
});

//add a user's GPS location to DB
var addlocation = function(req, res) {
    //console.log('hi');
    // set DB variable
    var db = req.db;
    // set variables
    var userId = req.body.user1id || req.params.user1id || req.body.user2id || req.params.user2id || req.body.user3id || req.params.user3id;
    var userLat = req.body.user1lat || req.params.user1lat || req.body.user2lat || req.params.user2lat || req.body.user3lat || req.params.user3lat;
	var userLong = req.body.user1long || req.params.user1long || req.body.user2long || req.params.user2long || req.body.user3long || req.params.user3long;
    
    console.log("userId, userLat, userLong : " + userId + " " + userLat + " " + userLong);
    
	if (!userId || !userLat || !userLong) { 
		res.send({result:'error', message:'user id, lat, and long are all required!!'}
	)};
	// if (!lat) { 
//         res.send({result:'error', message:'a latitude is required'}
//     )};
//     if (!long) { 
//         res.send({result:'error', message:'a longitude is required'}
//     )};

    // set db collection
    var collection = db.get('location');   

    // submit and update to DB: store in order {longitude, latitude}
    //TODO batch update
    collection.update(
		{ _id : userId },
		{ gps : {
				type : "Point",
				coordinates : [
					parseFloat(userLong),
					parseFloat(userLat)
				]}
		},
		{ upsert : true},
    	function (err, doc) {
        if (err) {
			console.log(err);
            res.send({result:'error', message: "There was a problem adding/updating user id and/or GPS to the database.", err: err});
        }
        else {
			var result = {result:'success', id : userId, lat : userLat, long : userLong};
            //debug
            console.log("result:'success' " + "id " + userId + " lat " + userLat + " long :" + userLong);
			res.send(result);
        }
    });
};

/* POST and PUT go to add cab */
router.put('/addlocation', addlocation);
router.put('/addlocation/:user1id', addlocation);
router.put('/addlocation/:user2id', addlocation);
router.put('/addlocation/:user3id', addlocation);
// router.put('/addlocation/:user1id/:user1lat/:user1long/:user2id/:user2lat/:user2long/:user3id/:user3lat/:user3long', addlocation);
router.post('/addlocation', addlocation);
router.post('/addlocation/:user1id', addlocation);
router.post('/addlocation/:user2id', addlocation);
router.post('/addlocation/:user3id', addlocation);
//router.post('/addlocation/:user1id/:user1lat/:user1long/:user2id/:user2lat/:user2long/:user3id/:user3lat/:user3long', addlocation);

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
