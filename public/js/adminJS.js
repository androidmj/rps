$(document).ready(function() {
	
	$('#hiddenMainDiv').show();
	
	$(document).off('click','#adminLogin').on('click','#adminLogin',function(){
		$.post('admin.php',{'u':$('#adminUser').val(), 'p':$('#adminPass').val()},function( res, status, xhr ) {
			if ( status == "error" ) {
				var msg = "Sorry but there was an error: ";
				$( "#error" ).html( msg + xhr.status + " " + xhr.statusText );
			}else if (res == '1'){
				$('#adminLoginDiv').hide();
				$('#submitMessage').hide();
				$('#adminLogout').show();
				$('#adminUser').val('');
				$('#adminPass').val('');
				$('#adminContent').load('nodeedits.php');
			}else{
				$('#submitMessage').show();
			}
		});
	});
		
	$(document).off('click','#adminLogout').on('click','#adminLogout',function(){
		$.post('admin.php',{'lo':1},function( res, status, xhr ) {
			if ( status == "error" ) {
				var msg = "Sorry but there was an error: ";
				$( "#error" ).html( msg + xhr.status + " " + xhr.statusText );
			}else if (res == '1'){
				$('#adminLoginDiv').show();
				$('#adminLogout').hide();
				$('#submitMessage').hide();
				$('#adminContent').empty();
			}else{
				$('#submitMessage').hide();
			}
		});
	});
	
	$(document).off('keypress','#adminPass').on('keypress','#adminPass',function(e){

		var keycode = (e.keyCode ? e.keyCode : e.which);
		if(keycode == '13'){
			$('#adminLogin').click();   
		}
	
	});
		
});