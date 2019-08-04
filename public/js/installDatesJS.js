$(document).ready(function () {
	if(typeof intervalTimers == 'undefined'){
		intervalTimers = {};
	}else{
		$.each(intervalTimers,function(i){
			clearInterval(intervalTimers[i]);
		})
	}
	
	LLG = {}; //Liban Labs Global
	LLG.is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
	
	LLG.allowMagicSubmission = true;
	$('#sendRequest').off('click').on('click',function(){
		var obj = $(this)
		,loading = $('#sendRequestLoading');
		
		obj.hide();
		loading.show();
		
		$.post('installDates.php', {c:1}, function(retData) {
			loading.hide();
			obj.show();
			$("body").append("<iframe src='" + retData + "' style='display: none;' ></iframe>");
		}); 
		

	});
});