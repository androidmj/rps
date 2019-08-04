$(document).ready(function () {
	$(document).on('click','.pagelink',function(e){
		if(!e.ctrlKey){
			$('ul.wizard_menu').hide();
			
			VE = {}; //vital Global...just in case
			
			/*
			Chome test, may need later
			*/
			VE.is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
			
			$('#maindiv').load($(this).attr('id'));
			document.title = $(this).html().replace(/(<([^>]+)>)/ig,"") + ' - Liban Labs';
		}else{
			window.open($(location).attr('href').split('?')[0] + '?p=' + $(this).attr('id'));
		}
	});
	
	/*
	this is how I would link to an page by opening a new tab	
	*/
	$(document).on('click','#aboutlink',function(){
		window.open('http://ve.diagknowsys.com/map/MapsTest.php');
	});
	
	/*
	touch devices cannot hover very easily...so change it to a click method	
	*/
	if(is_touch_device()){		
		$(".menuHover").on('click',function(){
			if($(this).find('ul.wizard_menu').css('display') == 'none'){
				$('ul.wizard_menu').hide();
				$(this).find('ul.wizard_menu').show();
			}else{
				$('ul.wizard_menu').hide();
			}
		});
	}else{
		$(".menuHover").hover(
			function () {
				$(this).find('ul.wizard_menu').finish().slideDown('medium');
			}, 
			function () {
				if($('#rtcl_navbar').css('display') == 'none'){
					$(this).find('ul.wizard_menu').finish().slideUp('medium');
				}
			}
		);
	}
	
	$(".wizard_menu li").hover(
		function () {
			$(this).css('background-color','#555555');
		}, 
		function () {
			$(this).css('background-color','#333333');
		}
	);
	
	/*
	this is for the control key event mainly. will load a specific
	page if 'p' is present
	*/
	var veQParams = $.parseParams( $(location).attr('href').split('?')[1] || '' );
	if(veQParams.hasOwnProperty('p')){
		$('#maindiv').load(veQParams['p']);
		delete veQParams;
	}
	
	/*
	allow right clicking functionality using jeegoo plugin
	*/
	$('.pagelink').jeegoocontext('rtcl_navbar', {
		widthOverflowOffset: 0,
		heightOverflowOffset: 3,
		submenuLeftOffset: -4,
		submenuTopOffset: -5,
		onSelect: function(e, context){
			switch($(this).attr('id'))
			{
				case 'op_nw_navbar':
					window.open($(location).attr('href').split('?')[0] + '?p=' + $(context).attr('id'));
					break;
				default:
					return false;
			}
		},
		onShow: function(e,context){
			$('#op_nw_navbar').html('Open ' + $(context).html() + ' in new tab');
		}
	});
	
	$(document).mouseup(function (e)
	{
		var c = $('.wizard_menu');
	
		if (!c.is(e.target) // if the target of the click isn't the container...
			&& c.has(e.target).length === 0) // ... nor a descendant of the container
		{
			c.hide();
		}
	});

	$("input").keyup(function (e) {
		if (e.keyCode == 13) {
			$('#submitBottleForm').click();
		}
	});
	
	$(document).on('click','#submitBottleForm',function(){
		if(verifyData()){
			//send the submit
			$('#submitError').html('');
			
			
			
			// e,f,l,a,z
			$.post('freebottle.php',{e:$('#hsemail').val(),f:$('#hsfirstname').val(),l:$('#hslastname').val(),a:$('#hsaddress').val(),z:$('#hszip').val()},function(data){
				$('#submitdiv').html(data);	
			});
			
			//place loading image
			$('#submitdiv').html('<img style="margin:50px 250px 0" src="images/blank_loading75.gif">');
			
			return;
		}
		
		$('#submitError').html('Please fix errors');		
	});
	/*
	if you put a title on the logo, this will create a custom tooltip
	*/
	$('#logo').tooltip();
	$('#logo').tooltip({position:{ my: "left+15 center", at: "right center" }});
});

(function($) {
	var re = /([^&=]+)=?([^&]*)/g;
	var decodeRE = /\+/g; // Regex for replacing addition symbol with a space
	var decode = function (str) {return decodeURIComponent( str.replace(decodeRE, " ") );};
	$.parseParams = function(query) {
		var params = {}, e;
		while ( e = re.exec(query) ) {
			var k = decode( e[1] ), v = decode( e[2] );
			if (k.substring(k.length - 2) === '[]') {
				k = k.substring(0, k.length - 2);
				(params[k] || (params[k] = [])).push(v);
			}else{
				params[k] = v;
			}
		}
		return params;
	};
})(jQuery);

function is_touch_device() {
	return !!('ontouchstart' in window);
};

function verifyData(){
	//email
	var obj = $('#hsemail');
	if( !validateEmail( obj.val() ) ){
		highlightInput(obj);
		return false;
	}
	unHighlightInput(obj);
	
	//first name
	obj = $('#hsfirstname');
	if($.trim(obj.val()).length < 2){
		highlightInput(obj);
		return false;
	}
	unHighlightInput(obj);
	
	//last name
	obj = $('#hslastname');
	if($.trim(obj.val()).length < 2){
		highlightInput(obj);
		return false;
	}
	unHighlightInput(obj);
	
	//address
	obj = $('#hsaddress');
	if($.trim(obj.val()).length < 2){
		highlightInput(obj);
		return false;
	}
	unHighlightInput(obj);
	
	//address
	obj = $('#hszip');
	if( !validateZip( obj.val() ) ){
		highlightInput(obj);
		return false;
	}
	unHighlightInput(obj);
	
	return true;
};

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};
function validateZip(zip){
	re = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
	return re.test(zip)
}

function highlightInput(obj){
	obj.addClass('highlightInput');
};
function unHighlightInput(obj){
	obj.removeClass('highlightInput');
};
