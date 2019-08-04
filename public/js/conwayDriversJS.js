$(document).ready(function () {
	//sometimes we have a genericPostTimer from a different tool.
	//disable it if we do.
	if(typeof intervalTimers == 'undefined'){
		intervalTimers = {};
	}else{
		$.each(intervalTimers,function(i){
			clearInterval(intervalTimers[i]);
		})
	}
	
	LLG = {}; //Liban Labs Global	
	
	LLG.genericTimer = {};
	
	$(document).off('click','#uploadRatchetFile').on('click','#uploadRatchetFile',function(){
		var ftype = getExtension($('#RatchetFile').val());
		if(ftype != 'xlsx' && ftype != 'xls'){
			$('#uploadMessage').html('Please attatch an Excel file.');
			return;
		}
		
		var formData = new FormData($('#ratchetUpload')[0]);
		$('#uploadMessage').html('');
		$('#fileLoading').show();
		$.ajax({
			url: 'parseConwayDrivers.php',  //Server script to process data
			type: 'POST',
			/*xhr: function() {  // Custom XMLHttpRequest
				var myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){ // Check if upload property exists
					myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // For handling the progress of the upload
				}
				return myXhr;
			},*/
			//Ajax events
			//beforeSend: beforeSendHandler,
			success: function(data){if(data.length<100){$('#uploadMessage').html(data);}else{$('#uploadDiv').append(data);}$('#fileLoading').hide();},
			error: function(data){console.log('error')},
			// Form data
			data: formData,
			//Options to tell jQuery not to process data or worry about content-type.
			cache: false,
			contentType: false,
			processData: false
		});
	});
	
	$(document).off('change',':file').on('change',':file',function(){
		var file = this.files[0];
		var name = file.name;
		var size = file.size;
		var type = file.type;
		//Your validation
	});
	
});

function trim1 (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

function allKeysToUpperCase(obj) {
    var output = {};
    for (i in obj) {
        if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
            output[i.toUpperCase()] = allKeysToUpperCase(obj[i]);
        } else {
            output[i.toUpperCase()] = obj[i];
        }
    }
    return output;
};

function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
};