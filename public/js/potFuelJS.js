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
	
	LLG.defPotPId = $('#potPId').val();
	LLG.defPotST = $('#potST').val();
	LLG.defPotET = $('#potET').val();
	
	
	$('#potPId, #potST, #potET').css('color','#777777');
	
	$('#potPId').off('focus').on('focus',function(event){
		if($(this).val() == LLG.defPotPId){
			$(this).val('');
			$(this).css('color','#333333');
		}
	});
	
	$('#potPId').off('blur').on('blur',function(event){
		if($(this).val() == ''){
			$(this).val(LLG.defPotPId);
			$(this).css('color','#777777');
		}
	});
	
	$('#potST').off('focus').on('focus',function(event){
		if($(this).val() == LLG.defPotST){
			$(this).val('');
			$(this).css('color','#333333');
		}
	});
	
	$('#potST').off('blur').on('blur',function(event){
		if($(this).val() == ''){
			$(this).val(LLG.defPotST);
			$(this).css('color','#777777');
		}
	});
	
	$('#potET').off('focus').on('focus',function(event){
		if($(this).val() == LLG.defPotET){
			$(this).val('');
			$(this).css('color','#333333');
		}
	});
	
	$('#potET').off('blur').on('blur',function(event){
		if($(this).val() == ''){
			$(this).val(LLG.defPotET);
			$(this).css('color','#777777');
		}
	});
	
	
	$('#potPId').off('keydown').on('keydown',function(event) {
        if (event.keyCode == 13) {
            $('#potFuelBut').click();
         }
    });
	
	$('#potST').off('keydown').on('keydown',function(event) {
        if (event.keyCode == 13) {
            $('#potFuelBut').click();
         }
    });
	
	$('#potET').off('keydown').on('keydown',function(event) {
        if (event.keyCode == 13) {
            $('#potFuelBut').click();
         }
    });
	
	$('#potPId, #potST, #potET').off('keyup').on('keyup',function(event) {
    	$(this).val($(this).val().replace(/\s/g,""));
    });
	
	LLG.allowPotSubmission = true;
	$('#potFuelBut').off('click').on('click',function(){
		if(LLG.allowPotSubmission){
			var pid = $('#potPId').val(),
			starttime = $('#potST').val(),
			endtime = $('#potET').val(),ignore;
			
			if(pid == '' || pid == LLG.defPotPId){
				return;
			}
			
			$('#potFuelReturnInfo').html('<img src="images/blank_loading75.gif" style="padding:20px 0 0 150px" />');
		
			LLG.potSubmission = false;
			
			include = ($('#potIncludeData').is(':checked') ) ? 1 : 0;
			
			$('#potFuelReturnInfo').load('potFuel.php',{p:pid,s:starttime,e:endtime,i:include},function(r,status,xhr){
				LLG.potSubmission = true;
				
				if (status == "error") {
					var msg = "Sorry but there was an error please try again: ";
					$('#potFuelReturnInfo').html('<span style="color:red">' + msg + xhr.status + " " + xhr.statusText + '</span>');
					return;
				}
			});
		}
	});
});