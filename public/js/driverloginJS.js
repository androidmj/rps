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
	
	//This is our watcher handsontable container
	LLG.cont = $('#dataTable');

	$('#vehicleNameSelector').load('driverLoginInfo.php',{ t: 'getPlatformInfoTable' },function(){
		tableSortPicker($(this).attr('id'),'v');
	});
	
	$('#driverNameSelector').load('driverLoginInfo.php',{ t: 'getDriverInfoTable' },function(){
		tableSortPicker($(this).attr('id'),'d');
	});
	
	$('#driverLogOutNames').load('driverLoginInfo.php',{ t: 'getDriverLogOutTable' },function(){
		tableSortPicker($(this).attr('id'),'r');
	});
	
	LLG.genericTimer = {};
	
	$('#dLoginBut').on('click',function(){
		var did = $('#driverLoginName').data('did')
		,vn = $('#vehicleLoginName').val()
		,dn = $('#driverLoginName').val()
		,pid = $('#vehicleLoginName').data('pid');
		
		if(confirm('Log in\nDriver: ' + dn + ' (' + did + ')\nVehicle: ' + vn)){	
			$.post('driverLoginInfo.php',{t:'loginDriver', p:pid, d:did, v:vn, n:dn},function(data){
				$('#driverLoginMsg').html(data);
			});
		}
	});
	
	$('#dRefreshB').off('click').on('click',function(){
		$('#driverLogOutNames').load('driverLoginInfo.php',{ t: 'getDriverLogOutTable' },function(){
			tableSortPicker($(this).attr('id'),'r');
			$('#driverLogoutMsg').html('List has been refreshed');
			setTimeout(function(){$('#driverLogoutMsg').html('');},5000);
		});
	});
	
	$(document).off('click',':button').on('click',':button',function(){
		var ftype = getExtension($('#driverFile').val());
		if(ftype != 'xlsx' && ftype != 'xls'){
			$('#driverUploadMessage').html('Please attatch an Excel file.');
			return;
		}
		
		var formData = new FormData($('#driverUpload')[0]);
		$('#driverUploadMessage').html('');
		$('#driverFileLoading').show();
		$.ajax({
			url: 'parseexcelYoungs.php',  //Server script to process data
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
			success: function(data){if(data.length<100){$('#driverUploadMessage').html(data);}else{$('#driverUploadDiv').append(data);}$('#driverFileLoading').hide();},
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

//create some lookup arrays for fast functionality
function adjustColHeaderData() {
    LLG.getColIndex = {};
	getColRealNameIndex = {};
    $.each(colHeaderData, function (i, v) {
        LLG.getColIndex[v] = i;
    });
	$.each(colHeaderDataActualNames, function (i, v) {
        getColRealNameIndex[v] = i;
    });
};


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

function customFilterChoices(choices,query,emptyOk){
	var ret,queryRegex = new RegExp(query, 'i');

	ret = choices.filter(function(choice){
	  return queryRegex.test(choice);
	});
		
	if(!emptyOk && ret.length == 0){
		ret = choices.slice(0);
	}
	
	return ret;
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

function tableSortPicker(name,type){
		var t = $('#' + name + 'Div');
		$('#' + name).tablesorter({widgets: ["zebra","filter"]});
		setTimeout(function(){
			$('#' + name).tablesorter({widgets: ["zebra","filter"]});
			switch(type){
				case 'r':
					remDriverClickEvents();
					break;
				
				case 'd':
					addDriverClickEvents();
					break;
					
				case 'v':
					addVehicleClickEvents();
					break;
				
				default:
					break;				
			}
		},2000);
		t.parent().css("border","1px solid rgb(170, 170, 170)");
		t.show();
		$('#tsFilter_' + name).on("click keyup blur",function(){
			var t = $(this).val();
			
			if(t == "" || t == "Search..."){
				$('#' + name).find("tr").show();
			}
		});
};

function remDriverClickEvents(){
	$('.remDriver').off('click').on('click',function(){
		var did = $(this).data('did')
		,vn = $(this).data('vn')
		,dn = $(this).data('dn');

		if( confirm('Log out\nDriver: ' + dn + ' (' + did + ')\nVehicle: ' + vn) ){
			$(this).remove();
			$.post('driverLoginInfo.php',{t:'logoutDriver', p:$(this).data('pid'), d:did, v:vn, n:dn},function(data){
				$('#driverLogoutMsg').html(data);
			});
		}
	});
};

function addDriverClickEvents(){
	$('.addDriver').off('click').on('click',function(){
		$('#driverLoginName').val($(this).data('dn'));
		$('#driverLoginName').data('did',$(this).data('did'));
	});
};

function addVehicleClickEvents(){
	$('.addVeh').off('click').on('click',function(){
		$('#vehicleLoginName').val($(this).data('vn'));
		$('#vehicleLoginName').data('pid',$(this).data('pid'));
	});
};

function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
};