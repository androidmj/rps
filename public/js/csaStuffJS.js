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
	
	LLG.defcsaId = $('#csaId').val();
	
	$('#csaId').off('focus').on('focus',function(event){
		if($(this).val() == LLG.defcsaId){
			$(this).val('');
			$(this).css('color','#333333');
		}
	});
	$('#csaId').off('blur').on('blur',function(event){
		if($(this).val() == ''){
			$(this).val(LLG.defcsaId);
			$(this).css('color','#777777');
		}
	});
	
	$('#csaId').keydown(function(event) {
        if (event.keyCode == 13) {
            $('#findCSA').click();
         }
    });
	
	LLG.allowMagicSubmission = true;
	$('#findCSA').off('click').on('click',function(){
		if(LLG.allowMagicSubmission){
			var cid = $('#csaId').val();
			if(cid == '' || cid == LLG.defcsaId){
				return;
			}
			
			$('#csaReturnInfo').html('<img src="images/blank_loading75.gif" style="padding:20px 0 0 150px" />');
		
			LLG.magicSubmission = false;
			$('#csaReturnInfo').load('csastuff.php',{c:cid},function(){
				LLG.magicSubmission = true;
			});
		}
	});
});

function magicImgLoad(){
	$('#loadingMagicChart').hide();
	$('#magicChartimg').show();
};