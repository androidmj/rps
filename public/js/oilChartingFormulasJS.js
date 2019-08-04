$(document).ready(function(e) {
	if(typeof intervalTimers == 'undefined'){
		intervalTimers = {};
	}else{
		$.each(intervalTimers,function(i){
			clearInterval(intervalTimers[i]);
		})
	}
	
	LLG = {}; //Liban Labs Global
	
	LLG.cont = $('#dataTable');
	
	LLG.colHeaderData = ['Message', 'Vehicle ID', 'Dates','Find Event'];
	LLG.colHeaderDataActualNames = ['Message', 'Vehicle ID', 'Dates','Find Event'];
	adjustColHeaderData();
	
	//SET global variables for verification purposes
    $.post("engineInfo.php", {
        t: '3'
    }, function (data, status) {
        //array that will hold all the engine info for quick validation of cells
        $.each(JSON.parse(data), function (key, value) {
            $('#customerNameSelector').append($("<option></option>").attr("value",
                value).text(key));
        });
    });
	
	$(document).off('change','#customerNameSelector')
		.on('change','#customerNameSelector', function () {
            var cu = $(this).val();
            if ($.isNumeric(cu)) {
                $.post('engineInfo.php',{t:'oilVeh',c:cu},function(data,status){
					LLG.CustomertagInfo=JSON.parse(data);
					adjustCustomerTaginfo();
					$('#hiddenMainDiv').show();
					LLG.cont.handsontable('render');
				  });
				
				//getVnaVehicles(cu);
				//genericPostTimer = setInterval(function(){getVnaVehicles(cu);},60000);
            } else {
                $('#hiddenMainDiv').hide('fast');
            }
        }
    );
	
	var buttonRenderer = function (instance,
        td, row, col, prop, value, cellProperties) {
		if($(td).find('.findEvents').css('display') == 'none'){
			return;
		}else{
        	var $but = $('<div style="text-align:center"><div class="findEvents blueBut" data-row="' + row + '" style="font-size:12px;padding:1px 2px">Find Events</div><img class="loadCurrentSettings" data-row="' + row + '" src="images/blank_loading20.gif" style="display:none" /></div>');
		}
        $(td).empty().append($but);
        return td;
    };
	
	var messageRenderer = function (instance,
        td, row, col, prop, value, cellProperties) {
		var t = $(td).find('.showTrannyRetMsg').css('display');
		var l = $(td).find('.loadingTrannyMessage').css('display');
		if(t == 'inline' || t == 'block' || l == 'inline' || l == 'block'){
			return;
		}else{
			var $msg = $('<div class="showTrannyMessage" data-row="' + row + '" style="z-index:5;position:absolute;margin-top:1px;padding:1px;margin-left:70px;display:none"><img style="display:none" class="loadingTrannyMessage" src="images/loadingRow.gif" /><div class="showTrannyRetMsg" style="display:none;background-color:#FF8000"></div></div>');
		}
        $(td).empty().append($msg);
        return td;
    };
	
	$("#dataTable").handsontable({
        colHeaders: LLG.colHeaderDataActualNames,
        startCols: Object.keys(LLG.getColIndex).length,
        startRows: 1,
		maxRows:1,
		width:500,
        autoWrapRow: true,
        contextMenu: true,
        columns: [{
            renderer: messageRenderer,
            readOnly: true,
            width: '1px'
        }, {
            renderer: myAutocompleteRenderer,
            editor: Handsontable.editors.AutocompleteEditor,
            source: function (query, process, row, col) {
				var r = $.ui.autocomplete.filter(LLG.CustomertagInfo, query);
        		process(r.slice(0, 10));
            },
            highlighter: colorHighlighter,
            strict: true,
            options: {
                items: 1000 //`options` overrides `defaults` defined in bootstrap typeahead
            }
        }, {
            type: 'week',
			width:150
        }, {
            renderer: buttonRenderer,
            readOnly: true
        }]
    });
	
	$(document).off('click','.findEvents')
		.on('click','.findEvents', function () {
            var row = $(this).data('row'),
                vehicle = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Vehicle ID']);
            if (vehicle == '' || vehicle == null) {
                alert('Enter a Truck ID');
            } else {

                var th = $(this),
                    loadgif = $('.loadCurrentSettings[data-row="' + row + '"]');
                th.hide();
                loadgif.show();

                var vehicleTag = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Vehicle ID']);

				$('#zero60AccelTable').load('getOilChartFormulas.php', {
                    c: $('#customerNameSelector').val(),
                    v: vehicleTag,
					d: LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Dates'])
                },function(){
					th.show();
                    loadgif.hide();
				});
            }
        }
    );
});

function myAutocompleteRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.AutocompleteRenderer.apply(this,arguments);
    if (typeof LLG.getCustomerTag == 'undefined') {
        return;
    }
    td.title = 'Type to show the list of options';
    var error = false;
    var title = '';
    clearHighlightError(td);
    if (value == null || value == '') {
        return;
    }
    switch (col) {
    case LLG.getColIndex['Vehicle ID']:
			if (!LLG.cont.handsontable('isEmptyRow',row)) {
				if(value != '' && !LLG.getCustomerTag.hasOwnProperty(value.toUpperCase())) {
					error = true;
					title = 'Invalid Vehicle ID';
				}
			}
			break;
    
    default:
        break;
    }
    if (error) {
        addHighlightError(td, title);
    } else {
        clearHighlightError(td);
    }
};

function randomString() {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 13;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
};

function clearHighlightError(td) {
    $(td).removeClass('handserror');
    $(td).attr('title', '');
};

function addHighlightError(td, title) {
    $(td).addClass('handserror');
    $(td).attr('title', title);
	$(td).tooltip({ position: { my: "right+30px top-55px"}});
};

function colorHighlighter(item) {
    var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    var label = item.replace(new RegExp('(' + query + ')',
        'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>';
    });
    return '<span style="margin-right: 10px; background-color: ' + item + '">&nbsp;&nbsp;&nbsp;</span>' + label;
};

function adjustColHeaderData() {
    LLG.getColIndex = {};
    $.each(LLG.colHeaderData, function (i, v) {
        LLG.getColIndex[v] = i;
    });
};

function adjustCustomerTaginfo(){
	LLG.getCustomerTag = {};
	$.each(LLG.CustomertagInfo,function(i,v){
		LLG.getCustomerTag[v]=1;		
	});
};

function chartLoaded($obj){
	$(obj).parent().find('img').eq(0).hide();
	$(obj).show();
};