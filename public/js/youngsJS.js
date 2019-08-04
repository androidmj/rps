var genericPostTimer = 0;
var rickrollcounter = 0;

$(document).ready(function () {
	$(document).on('click','.pagelink:not("#alphamap,#fuelsmasher,#logoutlink")',function(e){
		if(!e.ctrlKey){
			$('ul.wizard_menu').hide();
			
			if(typeof intervalTimers == 'undefined'){
				intervalTimers = {};
			}else{
				$.each(intervalTimers,function(i){
					clearInterval(intervalTimers[i]);
				})
			}
			
			LLG = {}; //Liban Labs Global
			LLG.is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
			
			$('#maindiv').load($(this).attr('id'));
			document.title = $(this).html().replace(/(<([^>]+)>)/ig,"") + ' - Liban Labs';
		}else{
			window.open($(location).attr('href').split('?')[0] + '?p=' + $(this).attr('id'));
		}
	});
	
	/** This is a Rick Rolling joke...delete if this goes to a customer. **/
	$(document).on('click','#strongMan',function(){
		$('.pagelink:not("#alphamap,#fuelsmasher,#logoutlink")').click();
	});
	
	$(document).on('click','#logoutlink',function(){
		$('#adminLogOutForm').submit();
	});
	
	$(document).on('click','#adminLogin',function(){
		$('#adminForm').submit();
	});
		
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
	
	var ratchetQParams = $.parseParams( $(location).attr('href').split('?')[1] || '' );
	if(ratchetQParams.hasOwnProperty('p')){
		$('#maindiv').load(ratchetQParams['p']);
		delete ratchetQParams;
	}
	
	$('.pagelink:not("#alphamap,#fuelsmasher")').jeegoocontext('rtcl_navbar', {
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
	
	$('#strongMan').tooltip();
	$('#strongMan').tooltip({position:{ my: "left+15 center", at: "right center" }});
});

function rickroll(){
	document.getElementById("rickroll").play();
};

function marioLoad(){
	document.getElementById("mariobrosmp3").play();
};

function marioLoadStop(){
	document.getElementById("mariobrosmp3").pause();
};

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

function initHelpTips(){
	$(document).off('click','#activatehelp').on('click','#activatehelp', function (){
		LLG.allHelpTitleIds = '';
		$.each(LLG.helpTitles,function(i,v){
			LLG.allHelpTitleIds += v.id + ',';
		});
		
		LLG.allHelpTitleIds = LLG.allHelpTitleIds.slice(0, - 1);
		
		if($(this).data('on')+'' == 'false'){
			$(this).data('on','true');
			$(this).html('turn off help tips');
			$.each(LLG.helpTitles,function(i,v){
				$(v.id).attr('title',v.title);
			});
   			$(LLG.allHelpTitleIds).tooltip({ position: {my: "center bottom",at: "right top"}});
		}else{
			$(this).data('on','false');
			$(this).html('turn on help tips');
			$(LLG.allHelpTitleIds).attr('title','');
		}
	});
}

function is_touch_device() {
	return !!('ontouchstart' in window);
};