var showRes = function (data) {
    $('#result').text(JSON.stringify(data, null, '  '));
};  
$( document ).ready(function() {
    $('#addlocation1').click(
        function(e) {
            var data = $('#formAddUserLocation').serialize();
            $.ajax(
                { url: '/addlocation/' + $('#inputUser1Id').val(),
                  type: 'PUT', 
                  data: data,
                  success: showRes
                }
            );  
        }   
    );
    $('#addlocation2').click(
        function(e) {
            var data = $('#formAddUserLocation').serialize();
            $.ajax(
                { url: '/addlocation/' + $('#inputUser2Id').val(),
                  type: 'PUT', 
                  data: data,
                  success: showRes
                }
            );  
        }   
    );
    $('#addlocation3').click(
        function(e) {
            var data = $('#formAddUserLocation').serialize();
            $.ajax(
                { url: '/addlocation/' + $('#inputUser3Id').val(),
                  type: 'PUT', 
                  data: data,
                  success: showRes
                }
            );  
        }   
    );
    $('#searchByTerm').click(
        function(e) {
            var data = $('#formAddUserLocation').serialize();
            $.ajax(
                { url: '/addlocation/' + $('#inputUser1Id').val(),
                  type: 'PUT', 
                  data: data,
                  success: showRes
                }
            );  
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

