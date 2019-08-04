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
	
	LLG.cont = $('#dataTable');
	
    LLG.colHeaderData = ['Message', 'Truck ID', 'Flash VNA'];
    LLG.colHeaderDataActualNames = ['Message', 'Truck ID', 'Flash VNA'];
	
    adjustColHeaderData();
	
    var vnaRenderer = function (instance,
        td, row, col, prop, value, cellProperties) {
        if (value != null && value.length > 40 && value.length < 50) {
            return;
        }
        var $but = 'off';
        if (typeof LLG.CustomervnaInfo != 'undefined') {
            vehicle = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Truck ID']);
            if (vehicle != null && vehicle != '' && LLG.CustomervnaInfo.hasOwnProperty(vehicle.toUpperCase())) {
				var t = $(td).find('.loadflashVNA').css('display');
				if(t == 'inline' || t == 'block' || ($(td).html().length >3 && $(td).html().length <20 )){
					return;
				}else{
					$but = $('<div style="text-align:center"><div class="flashVNA blueBut" data-row="' + row + '" style="font-size:12px;padding:1px 2px">Flash VNA</div><img class="loadflashVNA" data-row="' + row + '" src="images/blank_loading20.gif" style="display:none" /></div>');
				}
                
            }
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
        minSpareRows: 1,
        autoWrapRow: true,
        contextMenu: true,
        columns: [{
                renderer: messageRenderer,
            readOnly: true,
            width: '1px'
        }, {
               renderer: myAutocompleteRenderer,
                editor: Handsontable.editors.AutocompleteEditor,
            source: function (query, process) {
				var r = $.ui.autocomplete.filter(LLG.CustomertagInfo, query);
        		process(r.slice(0, 10));
            },
            highlighter: colorHighlighter,
            strict: true,
            options: {
                items: 1000 //`options` overrides `defaults` defined in bootstrap typeahead
            }
        }, {
                renderer: vnaRenderer,
            readOnly: true
        }]
    });
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
	
	intervalTimers['nodeStatus'] = null;
	$(document).off('change','#customerNameSelector')
		.on('change','#customerNameSelector', function () {
            var cu = $(this).val();
            if ($.isNumeric(cu)) {
                $.post('engineInfo.php',{t:'allVeh',c:cu},function(data,status){
					LLG.CustomertagInfo=JSON.parse(data);
					adjustCustomerTaginfo();
					$('#hiddenMainDiv').show();
					LLG.cont.handsontable('render');
				  });
				
                clearInterval(intervalTimers['nodeStatus']);
				getVnaVehicles(cu);
				intervalTimers['nodeStatus'] = setInterval(function(){getVnaVehicles(cu);},60000);
            } else {
                $('#hiddenMainDiv').hide('fast');
            }
        }
    );
	
	$(document).off('click','.flashVNA').on('click','.flashVNA', function () {
            var row = $(this).data('row'),
                vehicle = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Truck ID']);
            if (vehicle == '' || vehicle == null) {
                alert('Enter a Truck ID');
            } else {
                var th = $(this),
                    loadgif = $('.loadflashVNA[data-row="' + row + '"]');
                th.hide();
                loadgif.show();
                $.post('engineInfo.php', {
                    t: '5',
                    c: $('#customerNameSelector').val(),
                    v: LLG.cont.handsontable('getDataAtCell',
                        row, LLG.getColIndex['Truck ID'])
                }, function (data, status) {
                    th.parent().html(data);
                });
            }
        }
    );
	
	$(document).off('click','#removeMessages').on('click','#removeMessages', function () {
            LLG.cont.find('[data-column=' + LLG.getColIndex['Truck ID'] + ']').html('');
			LLG.cont.handsontable('render');			
        }
    );
});

function getVnaVehicles(cu){
	$.post('engineInfo.php', {t: '6',c: cu}, function (data, status) {
		LLG.CustomervnaInfo = JSON.parse(data);
		$('#hiddenMainDiv').show();
		LLG.cont.handsontable('render');
	});
};

function clearHighlightError(td) {
    $(td).removeClass('handserror');
    $(td).attr('title', '');
};

LLG.highlightTimeout = null;
function addHighlightError(td, title) {
    $(td).addClass('handserror');
    $(td).attr('title', title);
	clearTimeout(LLG.highlightTimeout);
	LLG.highlightTimeout = setTimeout(function(){$('.handserror').tooltip({ position: {my: "center bottom",at: "right top"}});},500);
};

function colorHighlighter(item) {
    var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    var label = item.replace(new RegExp('(' + query + ')',
        'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>';
    });
    return '<span style="margin-right: 10px; background-color: ' + item + '">&nbsp;&nbsp;&nbsp;</span>' + label;
};

function myAutocompleteRenderer(instance, td, row, col, prop, value, cellProperties) {
       Handsontable.renderers.AutocompleteRenderer.apply(this,arguments);
    if (typeof LLG.getCustomerTag == 'undefined') {
        return;
    }
    td.title = 'Type to show the list of options';
    var error = false;
    var title = '';
    var year, make, model, hp;
    clearHighlightError(td);
    if (value == null || value == '') {
        return;
    }
	
    switch (col) {
    case LLG.getColIndex['Truck ID']:
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