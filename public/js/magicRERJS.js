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
	
	LLG.defMagicPId = $('#magicPId').val();
	
	$('#magicPId').off('focus').on('focus',function(event){
		if($(this).val() == LLG.defMagicPId){
			$(this).val('');
			$(this).css('color','#333333');
		}
	});
	$('#magicPId').off('blur').on('blur',function(event){
		if($(this).val() == ''){
			$(this).val(LLG.defMagicPId);
			$(this).css('color','#777777');
		}
	});
	
	$('#magicPId').off('keydown').on('keydown',function(event) {
        if (event.keyCode == 13) {
            $('#findRearEndRatio').click();
         }
    });
	
	LLG.allowMagicSubmission = true;
	$('#findRearEndRatio').off('click').on('click',function(){
		if(LLG.allowMagicSubmission){
			var pid = $('#magicPId').val();
			if(pid == '' || pid == LLG.defMagicPId){
				return;
			}
			
			$('#magicReturnInfo').html('<img src="images/blank_loading75.gif" style="padding:20px 0 0 150px" />');
		
			LLG.magicSubmission = false;
			$('#magicReturnInfo').load('magicRER.php',{p:pid},function(r,status,xhr){
				LLG.magicSubmission = true;
				
				if (status == "error") {
					var msg = "Sorry but there was an error please try again: ";
					$('#magicReturnInfo').html('<span style="color:red">' + msg + xhr.status + " " + xhr.statusText + '</span>');
					return;
				}
				
				$('#setNewMagicRER').off('click').on('click',function(){
					var pid = $(this).data('p'),
					rer = $(this).data('r');
					
					if(pid == '' || rer == ''){
						return;
					}
					
					$('#setNewMagicRERwrapper').html('<img src="images/loadingRow.gif" style="padding-left:40px" />');
					
					$.post('engineInfo.php',{t:'insertRER',p:pid,r:rer},function(r){
						switch(r){
							case '1':
								$('#setNewMagicRERwrapper').html('<span style="color:blue">New ratio has been sent to vehicle.</span>');
								break
							
							case '2':
								$('#setNewMagicRERwrapper').html('<span style="color:blue">Already set to this value.</span>');
								break;
							
							default:
								$('#setNewMagicRERwrapper').html('<span style="color:red">An error occurred.</span>');
								break;
						}
					});
					
				});
			});
		}
	});
});

function magicImgLoad(){
	$('#loadingMagicChart').hide();
	$('#magicChartimg').show();
};