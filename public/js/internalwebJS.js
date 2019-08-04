var genericPostTimer = 0;
var rickrollcounter = 0;

$(document).ready(function () {
	$(document).on('click','.pagelink:not("#alphamap,#fuelsmasher,#logoutlink,#Breports")',function(e){
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
		
		var  p = document.getElementById("epicSax");
		
		if($('object#epicSax').length && $('object#epicSax').css('display') != 'none'){
			p.stopVideo();
			$('#epicSax').hide();
			return;
		}
		
		if($('audio').length){
			document.getElementById("rickroll").pause();
			rickrollcounter++;
			
			if(rickrollcounter%2 == 0){
				var params = { allowScriptAccess: "always" };
				var atts = { id: "epicSax", style:'position:absolute;z-index:10000' };
				swfobject.embedSWF("http://www.youtube.com/v/q44qwyHlMfk?version=3&enablejsapi=1",
								   "epicSax", "560", "315", "8", null, null, params, atts);

				$('#epicSax').show();
				setTimeout(function(){document.getElementById("epicSax").playVideo();},2000);
			}else{
				rickroll();
			}
		}
		
		
		
	});
	
	/** End of Rick Rolling **/
	
	$(document).on('click','#alphamap',function(){
		window.open('http://ratchet.diagknowsys.com/map/MapsTest.php');
	});
	
	$(document).on('click','#Breports',function(){
		window.open('https://tools.diagknowsys.com:8182/ocdb/static/reports/');
	});
	
	$(document).on('click','#logoutlink',function(){
		$('#adminLogOutForm').submit();
	});
	
	$(document).on('click','#fuelsmasher',function(){
		window.location = 'Fuel_Smasher_7.0.1.xlsx';
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
	
	$('#fuelsmasher').popover({content:"<img src='images/smasher.jpg' />"
                           ,html:'true'
                           ,trigger:'hover'
                           ,placement:'bottom'
                          });
});

function rickroll(){
	document.getElementById("rickroll").play();
};

function marioLoad(){
	document.getElementById("mariobrosmp3").play();
};

increaseMario = true;
function marioLoadStop(){
	if(increaseMario && $('#mariobrosmp3').find('source').attr('src').indexOf('long') > -1){
		setTimeout(function(){
			document.getElementById("mariobrosmp3").pause();
			increaseMario=false;
		},60000);
	}else{
		document.getElementById("mariobrosmp3").pause();
	}
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
   			$(LLG.allHelpTitleIds).tooltip({ position: {my: "center bottom",at: "right top"},content: function() {
				return $(this).attr('title');
			}});
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