$(document).ready(function () {

	if(typeof intervalTimers == 'undefined'){
		intervalTimers = {};
	}else{
		$.each(intervalTimers,function(i){
			clearInterval(intervalTimers[i]);
		})
	}
	
	LLG = {}; //Liban Labs Global

	LLG.cont = $('#dataTable');
	LLG.urlIndex = 1;
	LLG.urlArray = ['http://ratchet.diagknowsys.com/','http://r1.diagknowsys.com/','http://r2.diagknowsys.com/','http://r3.diagknowsys.com/'];
	LLG.url = function(){
		LLG.urlIndex=(LLG.urlIndex+1)%LLG.urlArray.length;
		return LLG.urlArray[LLG.urlIndex];
	};
	
  $('.vehName').val('');
  $.post("engineInfo.php",{t:'3'},function(data,status){
	//array that will hold all the engine info for quick validation of cells

	$.each(JSON.parse(data),function(key,value){
		$('#customerNameSelector')
         .append($("<option></option>")
         .attr("value",value)
         .text(key));
	});
  }); 
  
  intervalTimers['nodeserials'] = null;
  $(document).off('change','#customerNameSelector').on('change','#customerNameSelector',function(){
	  var cu = $(this).val();
	  if($.isNumeric(cu)){
		  $.post('engineInfo.php',{t:'allVeh',c:cu},function(data,status){
			LLG.CustomertagInfo=JSON.parse(data);
			adjustCustomerTaginfo();
			$('#hiddenMainDiv').show();
			LLG.cont.handsontable('render');
		  });
		  
		  clearInterval(intervalTimers['nodeserials']);
		  getNodeSerialVariables(cu);
		  intervalTimers['nodeserials'] = setInterval(function(){getNodeSerialVariables(cu);},60000);
	  }else{
		  $('#hiddenMainDiv').hide('fast');
	  }
  });
  
  
  
	$('.nodeSerial').autocomplete({
		source: function(request,response){
			$.post('engineInfo.php',{data:request.term,t:'getSerials'},function(data,status){
				response(JSON.parse(data));
			});
		},
		minLength: 0
	}).on('focus', function () {
		$(this).autocomplete('search', '');
	});
  
	$(document).off('click','#newCF,#obcRep,#obcRem').on('click','#newCF,#obcRep,#obcRem',function(){
		if($('.loadingTrannyMessage').is(':visible')){
			return;
		}
		if ($('.handserror:first').length == 0) {
			if( confirm('You are about to ' + $(this).data('text')) ){
				var h = LLG.cont,
					d = h.handsontable('getData',0, LLG.getColIndex['Vehicle ID'], h.handsontable('countRows') - 2, h.handsontable('countCols') - 1);
				var obj = {
					'data': d,
					'c': $('#customerNameSelector').val(),
					't': $(this).attr('id')
				};
				enterSwapInfo('swapwhizCases.php',obj);
			}
		} else {
			alert('Fix your errors.');
		}
	});
	$(document).off('click','#removeMessages').on('click','#removeMessages', function () {
            $('.showTrannyRetMsg').hide();
			LLG.cont.handsontable('render');			
        }
    );
	
	LLG.helpTitles = [
					{
						'id':'#obcRem',
						'title':'Use after removing an OBC from a vehicle.<br /><br />Clears bin logs.<br /><br />Removes assignment of truck platformid with this node.'
					},{
						'id':'#obcRep',
						'title':'Install an OBC on a vehicle.<br /><br />If current vehicle has an OBC associated with it, this removes the current OBC and installs new one.<br /><br />If there is no OBC associated with it, this adds the new OBC to the vehicle.<br /><br />Clears bin logs, pushes drivetrain.<br /><br />If an OBC is entered in the second column of this table, the new OBC will be set for the same diagknowsys distribution as the OBC being removed.'
					},{
						'id':'#newCF',
						'title':'Use before installing new CF card.<br /><br />Clears bin logs.<br /><br />Pushes drivetrain to new CF card.'
					},{
						'id':'#removeMessages',
						'title':'Remove all messages that appear over a row after using this tool.'
					}
				];
	initHelpTips();
		
    LLG.colHeaderData = ['Message', 'Vehicle ID','Node Serial Number','NEW node serial (optional)','Type'];
    LLG.colHeaderDataActualNames = ['Message', 'Vehicle ID','Node Serial Number','NEW node serial (optional)','Type'];
    
	adjustColHeaderData();
    
	var redRenderer = function (instance,
        td, row, col, prop, value, cellProperties) {
        Handsontable.TextCell.renderer.apply(this,
            arguments);
        $(td).css({
            fontColor: 'red'
        });
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
		afterChange: function (changes, source) {
            if (changes != null) {
				var col,adjacentVal,
				$obj = LLG.cont;
                for (var i = changes.length - 1; i >= 0; i--) {
                    col = changes[i][1];
					
					switch(col){
						case LLG.getColIndex['Vehicle ID']:
						var row = changes[i][0],
                            value = toUpperAllowNull(changes[i][3]);
                        if (value != '' && LLG.VehIdNodeSerialInfo.hasOwnProperty(value)) {
							adjacentVal =  toUpperAllowNull($obj.handsontable('getDataAtCell',row,LLG.getColIndex['Node Serial Number']));
							if(adjacentVal != LLG.VehIdNodeSerialInfo[value]){
								$obj.handsontable('setDataAtCell',row,LLG.getColIndex['Node Serial Number'],LLG.VehIdNodeSerialInfo[value]);
							}
                        }
						break;
						
						case LLG.getColIndex['Node Serial Number']:
						var row = changes[i][0],
                           value = toUpperAllowNull(changes[i][3]);
                        if (value != '' && LLG.NodeSerialVehIdInfo.hasOwnProperty(value)) {
							adjacentVal =  toUpperAllowNull($obj.handsontable('getDataAtCell',row,LLG.getColIndex['Vehicle ID']));
							if(adjacentVal != LLG.NodeSerialVehIdInfo[value]){
								$obj.handsontable('setDataAtCell',row,LLG.getColIndex['Vehicle ID'],LLG.NodeSerialVehIdInfo[value]);
							}
                        }
						default:
						break;
					}
                }
            }
        },
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
            renderer: myAutocompleteRenderer,
            editor: Handsontable.editors.AutocompleteEditor,
            source: function (query, process) {
				var r = $.ui.autocomplete.filter(LLG.NodeSerialInfo, query);
        		process(r.slice(0, 10));
            },
            highlighter: colorHighlighter,
            strict: true,
            options: {
                items: 1000 //`options` overrides `defaults` defined in bootstrap typeahead
            }
        },{
             renderer: myAutocompleteRenderer,
             editor: Handsontable.editors.AutocompleteEditor,
             source: function (query, process) {
				var r = $.ui.autocomplete.filter(LLG.NodeSerialInfo, query);
        		process(r.slice(0, 10));
            },
            highlighter: colorHighlighter,
            strict: true,
            options: {
                items: 1000 //`options` overrides `defaults` defined in bootstrap typeahead
            }
        },{
            type: 'dropdown',
            source: ['Non Warranty','Warranty']
        }]
    });
	
});

function myAutocompleteRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.AutocompleteRenderer.apply(this,arguments);
    if (typeof LLG.getNodeSerial == 'undefined') {
        return;
    }
    td.title = 'Type to show the list of options';
    var error = false,
	title = '',
	adjacentVal;
    clearHighlightError(td);
    if (value == null) {
        return;
    }else{
		value=toUpperAllowNull(value);
	}
    switch (col) {
		case LLG.getColIndex['Vehicle ID']:
			if (!LLG.cont.handsontable('isEmptyRow',row)) {
				if(value != '' && !LLG.getCustomerTag.hasOwnProperty(value)) {
					error = true;
					title = 'Invalid Vehicle ID';
				}
			}
			break;
		case LLG.getColIndex['Node Serial Number']:
			if (!LLG.cont.handsontable('isEmptyRow',row)) {
				if (value!= '' && !LLG.getNodeSerial.hasOwnProperty(value)) {
					error = true;
					title = 'Invalid Node Serial';
				}else if(LLG.AllNodeSerialVehIdInfo.hasOwnProperty(value) && LLG.AllNodeSerialVehIdInfo[value]['c'] != $('#customerNameSelector').val()){
					var veh = LLG.AllNodeSerialVehIdInfo[value]['u']
					,cust = $('#customerNameSelector option[value=' + LLG.AllNodeSerialVehIdInfo[value]['c'] + ']').html();
					error = true;
					title = 'Wrong Customer, this is in use on ' + cust + ' vehicle ' + veh;					
				}
			}
			break;
		case LLG.getColIndex['NEW node serial (optional)']:
			if (value != '' && !LLG.cont.handsontable('isEmptyRow',row)) {
				if (value!= '' && !LLG.getNodeSerial.hasOwnProperty(value)) {
					error = true;
					title = 'Invalid Node Serial';
				}else if(LLG.AllNodeSerialVehIdInfo.hasOwnProperty(value)){
					var veh = LLG.AllNodeSerialVehIdInfo[value]['u']
					,cust = $('#customerNameSelector option[value=' + LLG.AllNodeSerialVehIdInfo[value]['c'] + ']').html();
					error = true;
					title = 'Node in use on ' + cust + ' vehicle ' + veh;					
				}
			}
		default:
			break;
    }
    if (error) {
        addHighlightError(td, title);
    } else {
        clearHighlightError(td);
    }
};

function adjustCustomerTaginfo(){
	LLG.getCustomerTag = {};
	$.each(LLG.CustomertagInfo,function(i,v){
		LLG.getCustomerTag[v]=1;		
	});
};

function adjustNodeSerialInfo(){
	LLG.getNodeSerial = {};
	$.each(LLG.NodeSerialInfo,function(i,v){
		LLG.getNodeSerial[v]=1;		
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

function addHighlightErrorByCell(row, col, title) {
    LLG.cont.handsontable('getCell',row, col).className = 'handserror';
    LLG.cont.handsontable('getCell',row, col).title = title;
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

function enterSwapInfo(site,obj) {
    $('.showTrannyMessage').show();
    $('.showTrannyRetMsg').hide();
    $('.loadingTrannyMessage').show();
    $.post(site, obj, function (data, status) {
		try{
			var jsonMsgData = JSON.parse(data);
			$('.loadingTrannyMessage').hide();
			$('.showTrannyRetMsg').show();
			$.each(jsonMsgData,
				function (i, v) {
					$('.showTrannyMessage[data-row=' + i + ']').find('.showTrannyRetMsg').html(v);
				}
			);
		}catch(err){
			console.log('Error: ' + err.message);	
		}
    });
};
function toUpperAllowNull(obj){
	if(obj != null ){
		obj = obj.toUpperCase();
	}else{
		obj = '';
	}
	return obj;
};

function getNodeSerialVariables(cu){
	$.post('engineInfo.php',{t:'getSerials'},function(data,status){
		LLG.NodeSerialInfo=JSON.parse(data);
		adjustNodeSerialInfo();
		$('#hiddenMainDiv').show();
		LLG.cont.handsontable('render');
	});
	
	$.post('engineInfo.php',{t:'getVehIdSerials',c:cu},function(data,status){
		LLG.VehIdNodeSerialInfo=JSON.parse(data);
		LLG.NodeSerialVehIdInfo = {};
		$.each(LLG.VehIdNodeSerialInfo,function(i,v){
			LLG.NodeSerialVehIdInfo[v]=i;
		});
	});
	
	$.post('engineInfo.php',{t:'getAllCustVehIdSerials'},function(data,status){
		LLG.AllNodeSerialVehIdInfo=JSON.parse(data);
	});
};