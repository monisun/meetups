var showRes = function (data) {
    debugger;
    $('#result').val(JSON.stringify(data, null, '  '));
};  
$( document ).ready(function() {
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

