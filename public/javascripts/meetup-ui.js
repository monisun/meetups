var showRes = function (data) {
    debugger;
    $('#result').val(JSON.stringify(data, null, '  '));
};  

var renderMap = function() {
    // create a map in the "map" div, set the view to a given place and zoom, default to SF
    var map = L.map('map').setView([37.7756, -122.4193], 13);

    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

    // add a marker in the given location, attach some popup content to it and open the popup
    L.marker([37.7756, -122.4193]).addTo(map)
        .bindPopup('Your current location!')
        .openPopup();    
};


$( document ).ready(function() {
    renderMap();
    
    $('#searchByLocation').click(
        function(e) {
            console.log('executing #searchByLocation');
            var data = $('#formSearchByLocation').serialize();
            $.ajax(
                { url: '/searchByLocation/' + $('#inputTerm').val(),
                  type: 'POST', 
                  data: data,
                  success: showRes
                }
            );  
        }   
    );
    
    $('#searchAddr').click(
        function(e) {
            console.log('executing #searchAddr');
            var input = document.getElementById("addr");

            $.getJSON('http://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + input.value, 
                function(data) {
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


