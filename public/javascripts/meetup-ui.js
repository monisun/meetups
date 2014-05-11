var showRes = function (data) {
    debugger;
    $('#result').val(JSON.stringify(data, null, '  '));
};  

var setLocationMarkers = function() {  
    var listUserId = [];  
    var listLat = [];
    var listLong = [];
    
    if ($('#inputUser1Id')) {
        listUserId.push($('#inputUser1Id').val());
    }
    if ($('#inputUser1Lat')) {
        listLat.push($('#inputUser1Lat').val());
    }
    if ($('#inputUser1Long')) {
        listLong.push($('#inputUser1Long').val());
    }
    if ($('#inputUser2Id')) {
        listUserId.push($('#inputUser2Id').val());
    }
    if ($('#inputUser2Lat')) {
        listLat.push($('#inputUser2Lat').val());
    }
    if ($('#inputUser2Long')) {
        listLong.push($('#inputUser2Long').val());
    }
    if ($('#inputUser3Id')) {
        listUserId.push($('#inputUser3Id').val());
    }
    if ($('#inputUser3Lat')) {
        listLat.push($('#inputUser3Lat').val());
    }
    if ($('#inputUser3Long')) {
        listLong.push($('#inputUser3Long').val());
    }
    
    for (var i=0; i<listLat.length; i++) {
        console.log(' debug markers: ');
        console.log(listLat);
        console.log(listLong);
        console.log(listUserId);
        //console.log(map);
        // add a marker in the given location, attach some popup content to it and open the popup
        L.marker([parseFloat(listLat[i]), parseFloat(listLong[i])]).addTo(map)
             .bindPopup(listUserId[i] + "!")
             .openPopup();   
        map.fitBounds([[listLat[0], listLong[0]], [listLat[1], listLong[1]], [listLat[2], listLong[2]]], [20, 20]); 
    }; 
}

window.renderInitialMap = function(e) {
    // create a map in the "map" div, set the view to a given place and zoom, default to SF
    window.map = L.map('map').setView([37.7756, -122.4193], 13);

    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

    // add a marker in the given location, attach some popup content to it and open the popup
    L.marker([37.7756, -122.4193]).addTo(map)
        .bindPopup('Your current location!')
        .openPopup();  
}

var renderYelpResults = function(data) {
    $('#result').val("");
    debugger;
    //TODO need to remove whitespace (from where?)
    $.each(data, function(index, item) {  
        console.log("index: " + index);
        console.log("item: " + item);        
        /*  map['name'] = item.name;
          map['url'] = item.url;
          map['image_url'] = item.image_url;
          map['rating'] = item.rating;
          map['review_count'] = item.review_count;
          map['location'] = item.location;
         */
        $('#result').val($('#result').val() + "\n" + (index + 1) + ": " + item['name'] + " rating: " + item['rating'] + " review_count: " + item['review_count'] 
                                    + "\nurl: " + item['url'] 
                                    + "\naddr: " + item['location'].display_address +  "\n");
    });
}


$( document ).ready(function() {
   
    $('#searchByLocation').click(
        function(e) {
            console.log('executing #searchByLocation');
            var data = $('#formSearchByLocation').serialize();
            $.ajax(
                { url: '/searchByLocation/' + $('#inputTerm').val(),
                  type: 'POST', 
                  data: data,
                  success: renderYelpResults
                }
            );  
            setLocationMarkers();
        }   
    );
    
    $('#searchAddr').click(
        function(e) {
            console.log('executing #searchAddr');
            var input = document.getElementById("addr");

            $.getJSON('http://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + input.value, 
                function(data) {
                    console.log('address search:');
                    console.log(data);
                });
        }
    );
    
    
    
    
    
    
    $('#searchnearestcabs').click(
        function(e) {
            var data = $('#formGetCab').serialize();
            $.get(
                '/cabs/' + $('#inputGetCabId').val(),
                data,
                showRes                
            );
        }   
    );
    $('#deletecabsBtn').click(
        function(e) {
            var cabId = $('#inputDeleteCabId').val();
            if (!cabId) {
                return;
            }
            $.ajax(
                { url: '/cabs/' + cabId,
                  type: 'DELETE', 
                  success: showRes
                }
            );             
        }   
    );
    $('#deleteallcabsBtn').click(
        function(e) {
            $.ajax(
                { url: '/cabs',
                  type: 'DELETE', 
                  success: showRes
                }
            );             
        }   
    );
});


