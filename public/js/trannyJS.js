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
	
    LLG.colHeaderData = ['Message', 'Truck ID', 'Year', 'Make', 'Model', 'Engine Make', 'Engine Model',
						'HP', 'Torque', 'Tranny Make', 'Tranny Model', 'Rear End Ratio', 'Current Settings'];
    LLG.colHeaderDataActualNames = ['Message','Truck ID', 'Year', 'Make', 'Model', 'Engine Make', 'Engine Model',
									 'HP', 'Torque (lb-ft)', 'Transmission Make', 'Transmission Model', 'Rear', 'See Settings'];
    adjustColHeaderData();

    var cellRenderer = function (instance,
        td, row, col, prop, value, cellProperties) {
        var escaped = Handsontable.helper.stringify(value);
        td.innerHTML = escaped;
        switch (col) {
        case LLG.getColIndex['Truck ID']:
            if (LLG.cont.handsontable('isEmptyRow',row)) {
                clearHighlightError(td);
            } else {
                if (value == null || value == '' || value.length > 100) {
                    addHighlightError(td,'Enter a valid vehicle ID less than 100 characters');
                } else {
                    if (LLG.CustomertagInfo.hasOwnProperty(value.toUpperCase())) {
                        addHighlightError(td,'There is already a vehicle with this ID');
                    }else if(!LLG.noDTCustomertagInfo.hasOwnProperty(value.toUpperCase())){
						addHighlightError(td,'This Truck ID does not exist.');
					}else{
                        clearHighlightError(td);
                    }
                }
            }
            break;
        case LLG.getColIndex['Rear End Ratio']:
            if (value != null && value != '' && (isNaN(value) || value > 8 || value < 1)) {
                addHighlightError(td, 'Enter a valid ratio between 1 and 10');
            } else {
                if (!isNaN(escaped) && escaped != '') {
                    td.innerHTML = parseFloat(escaped).toFixed(2);
                }
                clearHighlightError(td);
            }
            break;
        }
        return td;
    };
    var buttonRenderer = function (instance,
        td, row, col, prop, value, cellProperties) {
		if($(td).find('.showCurrentSettings').css('display') == 'none'){
			return;
		}else{
        	var $but = $('<div style="text-align:center"><div class="showCurrentSettings blueBut" data-row="' + row + '" style="font-size:12px;padding:1px 2px">See Settings</div><img class="loadCurrentSettings" data-row="' + row + '" src="images/blank_loading20.gif" style="display:none" /></div>');
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
        /*afterChange: function (changes, source) {
            if (changes != null) {
                for (var i = changes.length - 1; i >= 0; i--) {
                    var col = changes[i][1];
                    if (col == LLG.getColIndex['Year'] || (col > LLG.getColIndex['Model'] && col < LLG.getColIndex['Tranny Make'])) {
                        var row = changes[i][0],
                            year = LLG.cont.handsontable('getDataAtCell',row,LLG.getColIndex['Year']),
                            make = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell',row,LLG.getColIndex['Engine Make'])),
                            model = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell',row,LLG.getColIndex['Engine Model'])),
                            hp = LLG.cont.handsontable('getDataAtCell',row,LLG.getColIndex['HP']),
                            value = LLG.cont.handsontable('getDataAtCell',row,LLG.getColIndex['Torque']);
							
                        if (value != '' && LLG.allEngineInfo.hasOwnProperty(year) && LLG.allEngineInfo[year].hasOwnProperty(make) && LLG.allEngineInfo[year][make].hasOwnProperty(model) && LLG.allEngineInfo[year][make][model].hasOwnProperty(hp) && LLG.allEngineInfo[year][make][model][hp].hasOwnProperty(value)) {
                            LLG.cont.handsontable('setDataAtCell',row,LLG.getColIndex['Engine ID'],
                                LLG.allEngineInfo[year][make][model][hp][value]);
                            LLG.cont.handsontable('getCell',row,LLG.getColIndex['Engine ID']).className = '';
                        } else {
                            LLG.cont.handsontable('setDataAtCell',row,LLG.getColIndex['Engine ID'],
                                '');
                            LLG.cont.handsontable('getCell',row,LLG.getColIndex['Engine ID']).className = 'handserror';
                            LLG.cont.handsontable('getCell',row,LLG.getColIndex['Engine ID']).title = 'Enter a valid engine';
                        }
                    } else if (col == LLG.getColIndex['Tranny Make'] || col == LLG.getColIndex['Tranny Model']) {
                        var row = changes[i][0],
                            make = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell',row,LLG.getColIndex['Tranny Make'])),
                            value = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell',row,LLG.getColIndex['Tranny Model']));
                        if (value != '' && LLG.allTrannyInfo.hasOwnProperty(make) && LLG.allTrannyInfo[make].hasOwnProperty(value)) {
                            LLG.cont.handsontable('setDataAtCell',row,LLG.getColIndex['Tranny ID'],LLG.allTrannyInfo[make][value]);
                            LLG.cont.handsontable('getCell',row,LLG.getColIndex['Tranny ID']).className = '';
                        } else {
                            LLG.cont.handsontable('setDataAtCell',row,LLG.getColIndex['Tranny ID'],'');
                            LLG.cont.handsontable('getCell',row,LLG.getColIndex['Tranny ID']).className = 'handserror';
                            LLG.cont.handsontable('getCell',row,LLG.getColIndex['Tranny ID']).title = 'Enter a valid tranny';
                        }
                    }
                }
            }
        },*/
        columns: [{
            renderer: messageRenderer,
            readOnly: true,
            width: '1px'
        }, {
            renderer: cellRenderer
        }, {
            //year
            renderer: myAutocompleteRenderer,
            editor: Handsontable.editors.AutocompleteEditor,
            source: function (query, process, row, col) {
                var r = Object.keys(LLG.allEngineInfo);
				var c = customFilterChoices(r,query,false);
                process(c);
            },
            highlighter: colorHighlighter,
            strict: true,
            options: {
                items: 1000 //`options` overrides `defaults` defined in bootstrap typeahead
            }
        }, {
            renderer: cellRenderer
        }, {
            renderer: cellRenderer
        }, {
            //engine make
			renderer: myAutocompleteRenderer,
			editor: Handsontable.editors.AutocompleteEditor,
			source: function (query, process) {
				var year = LLG.cont.handsontable('getDataAtCell',this.row, LLG.getColIndex['Year']);
				if (year == null || year == '') {
					return;
				} else {
					if (typeof LLG.allEngineInfo[year] != 'undefined') {
						var r = Object.keys(LLG.allEngineInfo[year]);
						var c = customFilterChoices(r,query,false);
						process(c);
					}
				}
			},
			highlighter: colorHighlighter,
			strict: true,
			options: {
				items: 1000 //`options` overrides `defaults` defined in bootstrap typeahead
			}
        }, {
            //engine model
			renderer: myAutocompleteRenderer,
			editor: Handsontable.editors.AutocompleteEditor,
            source: function (query, process) {
                var year = LLG.cont.handsontable('getDataAtCell',this.row, LLG.getColIndex['Year']);
                var make = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell', this.row, LLG.getColIndex['Engine Make']));
                if (typeof LLG.allEngineInfo[year] != 'undefined' && typeof LLG.allEngineInfo[year][make] != 'undefined') {
                    var r = Object.keys(LLG.allEngineInfo[year][make]);
                    var c = customFilterChoices(r,query,false);
                    process(c);
                }
            },
            highlighter: colorHighlighter,
            strict: true,
            options: {
                items: 1000 //`options` overrides `defaults` defined in bootstrap typeahead
            }
        }, {
            //hp
			renderer: myAutocompleteRenderer,
			editor: Handsontable.editors.AutocompleteEditor,
            source: function (query, process) {
                var year = LLG.cont.handsontable('getDataAtCell',this.row, LLG.getColIndex['Year']);
                var make = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell', this.row, LLG.getColIndex['Engine Make']));
                var model = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell', this.row, LLG.getColIndex['Engine Model']));
                if (typeof LLG.allEngineInfo[year] != 'undefined' && typeof LLG.allEngineInfo[year][make] != 'undefined' && typeof LLG.allEngineInfo[year][make][model] != 'undefined') {
                    var r = Object.keys(LLG.allEngineInfo[year][make][model]);
                    var c = customFilterChoices(r,query,false);
                    process(c);
                }
            },
            highlighter: colorHighlighter,
            strict: true,
            options: {
                items: 1000 //`options` overrides `defaults` defined in bootstrap typeahead
            }
        }, {
            //torque
			renderer: myAutocompleteRenderer,
			editor: Handsontable.editors.AutocompleteEditor,
			source: function (query, process) {
				var year = LLG.cont.handsontable('getDataAtCell',this.row, LLG.getColIndex['Year']);
				var make = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell', this.row, LLG.getColIndex['Engine Make']));
				var model = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell', this.row, LLG.getColIndex['Engine Model']));
				var hp = LLG.cont.handsontable('getDataAtCell', this.row, LLG.getColIndex['HP']);
				if (typeof LLG.allEngineInfo[year] != 'undefined' && typeof LLG.allEngineInfo[year][make] != 'undefined' && typeof LLG.allEngineInfo[year][make][model] != 'undefined' && typeof LLG.allEngineInfo[year][make][model][hp] != 'undefined') {
					var r = Object.keys(LLG.allEngineInfo[year][make][model][hp]);
					var c = customFilterChoices(r,query,false);
					process(c);
				}
			},
			highlighter: colorHighlighter,
			strict: true,
			options: {
				items: 1000 //`options` overrides `defaults` defined in bootstrap typeahead
			},
			width:'80px'
        }, {
		//tranny make
			renderer: myAutocompleteRenderer,
			editor: Handsontable.editors.AutocompleteEditor,
            source: function (query, process) {
                var r = Object.keys(LLG.allTrannyInfo);
                var c = customFilterChoices(r,query,false);
                process(c);
            },
            highlighter: colorHighlighter,
            strict: true,
            options: {
                items: 1000 //`options` overrides `defaults` defined in bootstrap typeahead
            },
			width:'140px'
        }, {
		//tranny model
			renderer: myAutocompleteRenderer,
			editor: Handsontable.editors.AutocompleteEditor,
            source: function (query, process) {
                var make = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell',this.row, LLG.getColIndex['Tranny Make']));
                if (make == null || make == '') {
                    return;
                } else {
                    if (typeof LLG.allTrannyInfo[make] != 'undefined') {
                        var r = Object.keys(LLG.allTrannyInfo[make]);
                        var c = customFilterChoices(r,query,false);
                    	process(c);
                    }
                }
            },
            highlighter: colorHighlighter,
            strict: true,
            options: {
                items: 1000 //`options` overrides `defaults` defined in bootstrap typeahead
            },
			width:'200px'
        }, {
			renderer: cellRenderer
        }, {
			renderer: buttonRenderer,
			readOnly: true
        }]
    });
    //SET global variables for verification purposes
    $.post(LLG.url() + "engineInfo.php", {
        t: '0'
    }, function (data, status) {
        //array that will hold all the engine info for quick validation of cells
        LLG.allEngineInfo = JSON.parse(data);
    });
    $.post(LLG.url() + "engineInfo.php", {
        t: '1'
    }, function (data, status) {
        //array that will hold all the engine info for quick validation of cells
        LLG.allTrannyInfo = JSON.parse(data);
    });
	$.post(LLG.url() + "engineInfo.php", {
        t: 'trannyInfoArrayCompressed'
    }, function (data, status) {
        //array that will hold all the engine info for quick validation of cells
        LLG.allTrannyInfoC = JSON.parse(data);
    });
    $.post(LLG.url() + "engineInfo.php", {
        t: '3'
    }, function (data, status) {
        //array that will hold all the engine info for quick validation of cells
        $.each(JSON.parse(data), function (key, value) {
            $('#customerNameSelector').append($("<option></option>").attr("value",
                value).text(key));
        });
    });
	
	//Watcher gets updated every minute
	intervalTimers['getcustinfo'] = null;
	clearInterval(intervalTimers['getcustinfo']);
	
	$(document).off('change','#customerNameSelector')
    	.on('change','#customerNameSelector', function () {
            var cu = $(this).val();
            if ($.isNumeric(cu)) {				
			    getCustomerinfoArrays(cu);
            } else {
                $('#hiddenMainDiv').hide('fast');
            }
        }
    );
	$(document).off('click','#submitTranny')
		.on('click','#submitTranny', function () {
			
			if(LLG.cont.handsontable('countRows') == 1){
				alert('No trucks submitted.');
			}
			
/*            if ($('.handserror:first').length > 0) {
                alert('please fix red cells');
            } else {*/
                
				if( confirm('You are about to ' + $(this).html()) ){
					var h = LLG.cont,
						d = h.handsontable('getData',0, LLG.getColIndex['Truck ID'], h.handsontable('countRows') - 2, LLG.getColIndex['Rear End Ratio']);
						computeEngAndTrannyId(d);
					var obj = {
						"data": d,
						"c": $('#customerNameSelector').val()
					};
					enterTrannyInfo(obj);
				}
            /*}*/
        }
    );
	$(document).off('click','#resendTranny')
		.on('click','#resendTranny', function () {
            if ($('.handserror:first').length > 0) {
				if( confirm('You are about to ' + $(this).html()) ){
					var h = LLG.cont,
						d = h.handsontable('getData',0, LLG.getColIndex['Truck ID'], h.handsontable('countRows') - 2, LLG.getColIndex['Rear End Ratio']);
						computeEngAndTrannyId(d);
					var obj = {
						'data': d,
						'c': $('#customerNameSelector').val(),
						'r': 1
					};
					enterTrannyInfo(obj);
				}
            } else {
                alert('These trucks do not have drivetrains yet.');
            }
        }
    );
	$(document).off('click','#updateTranny')
		.on('click','#updateTranny', function () {
            if ($('.handserror:first').length > 0) {
				if( confirm('You are about to ' + $(this).html()) ){
					var h = LLG.cont,
						d = h.handsontable('getData',0, LLG.getColIndex['Truck ID'], h.handsontable('countRows') - 2, LLG.getColIndex['Rear End Ratio']);
						computeEngAndTrannyId(d);
					var obj = {
						'data': d,
						'c': $('#customerNameSelector').val(),
						'r': 2
					};
					enterTrannyInfo(obj);
				}
            } else {
                alert('These trucks do not have drivetrains yet. First submit a drivetrain.');
            }
        }
    );
	$(document).off('click','.showCurrentSettings')
		.on('click','.showCurrentSettings', function () {
            var row = $(this).data('row'),
                vehicle = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Truck ID']);
            if (vehicle == '' || vehicle == null) {
                alert('Enter a Truck ID');
            } else {
                var th = $(this),
                    loadgif = $('.loadCurrentSettings[data-row="' + row + '"]');
                th.hide();
                loadgif.show();
                $.post(LLG.url() + 'engineInfo.php', {
                    t: '4',
                    c: $('#customerNameSelector').val(),
                    v: LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Truck ID'])
                }, function (data, status) {
                    LLG.cont.handsontable('populateFromArray',row, LLG.getColIndex['Year'], [JSON.parse(data)], row, LLG.getColIndex['Rear End Ratio']);
                    th.show();
                    loadgif.hide();
                });
            }
        }
    );
	$(document).off('click','#removeMessages')
		.on('click','#removeMessages', function () {
            $('.showTrannyRetMsg').hide();
			LLG.cont.handsontable('render');			
        }
    );
	
	$(document).off('click',':button').on('click',':button',function(){
		var ftype = getExtension($('#trannyFile').val());
		if(ftype != 'xlsx' && ftype != 'xls'){
			$('#trannyUploadMessage').html('Please attatch an Excel file.');
			return;
		}
		
		var formData = new FormData($('#trannyUpload')[0]);
		$('#trannyUploadMessage').html('');
		$('#trannyFileLoading').show();
		$.ajax({
			url: 'parseexcel.php',  //Server script to process data
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
			success: function(data){if(data.length<100){$('#trannyUploadMessage').html(data);}else{$('#hiddenMainDiv').append(data);}$('#trannyFileLoading').hide();},
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
	
	LLG.helpTitles = [
					{
						'id':'#submitTranny',
						'title':'If any parameters are missing from the drivetrain or platform configuration, use this. Once a vehicle has all information needed in the database, the cell will turn red. To update any paramters after the Truck ID cell turns red, use the Update Drivetrain button.'
					},{
						'id':'#resendTranny',
						'title':'Push the current drivetrain to the OBC. Most tools will do this automatically if the job requries it.'
					},{
						'id':'#updateTranny',
						'title':'To update one parameter, for example a rear end ratio, you only need to enter the vehicle id and the new rear end ratio. A new drivetrain will be pushed to the OBC if needed.'
					},{
						'id':'#removeMessages',
						'title':'Remove any messages that appear over a row after using this tool.'
					}
				];
	initHelpTips();
});

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
    LLG.cont.handsontable('getCell',
        row, col).className = 'handserror';
    LLG.cont.handsontable('getCell',
        row, col).title = title;
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
    if (typeof LLG.allEngineInfo == 'undefined') {
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
    case LLG.getColIndex['Year']:
        if (!LLG.allEngineInfo.hasOwnProperty(value)) {
            error = true;
            title = 'Enter 4 digit year';
        }
        break;
    case LLG.getColIndex['Engine Make']:
        year = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Year']);
        if (!LLG.allEngineInfo.hasOwnProperty(year) || !LLG.allEngineInfo[year].hasOwnProperty(value.toUpperCase())) {
            error = true;
            title = 'Select a valid Engine Make';
        }
        break;
    case LLG.getColIndex['Engine Model']:
        year = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Year']);
        make = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Engine Make']));
        if (!LLG.allEngineInfo.hasOwnProperty(year) || !LLG.allEngineInfo[year].hasOwnProperty(make) || !LLG.allEngineInfo[year][make].hasOwnProperty(value.toUpperCase())) {
            error = true;
            title = 'Select a valid Engine Model';
        }
        break;
    case LLG.getColIndex['HP']: //hp
        year = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Year']);
        make = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Engine Make']));
        model = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Engine Model']));
        if (!LLG.allEngineInfo.hasOwnProperty(year) || !LLG.allEngineInfo[year].hasOwnProperty(make) || !LLG.allEngineInfo[year][make].hasOwnProperty(model) || !LLG.allEngineInfo[year][make][model].hasOwnProperty(value)) {
            error = true;
            title = 'Enter a valid horsepower';
        }
        break;
    case LLG.getColIndex['Torque']: //torque
        year = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Year']);
        make = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Engine Make']));
        model = toUpperAllowNull(LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Engine Model']));
        hp = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['HP']);
        if (!LLG.allEngineInfo.hasOwnProperty(year) 
			|| !LLG.allEngineInfo[year].hasOwnProperty(make) 
			|| !LLG.allEngineInfo[year][make].hasOwnProperty(model) 
			|| !LLG.allEngineInfo[year][make][model].hasOwnProperty(hp) 
			|| !LLG.allEngineInfo[year][make][model][hp].hasOwnProperty(value)
		) {
            error = true;
            title = 'Enter a valid torque';
        }
        break;
    case LLG.getColIndex['Tranny Make']: //tranny make
        if (!LLG.allTrannyInfoC.hasOwnProperty(toUpperCompressAllowNull(value))) {
            error = true;
            title = 'Select a valid Transmission Make';
        }
        break;
    case LLG.getColIndex['Tranny Model']: //tranny make
        make = toUpperCompressAllowNull(LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Tranny Make']));
        if (!LLG.allTrannyInfoC.hasOwnProperty(make) || !LLG.allTrannyInfoC[make].hasOwnProperty(toUpperCompressAllowNull(value))) {
            error = true;
            title = 'Select a valid Transmission Model';
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

function enterTrannyInfo(obj) {
    $('.showTrannyMessage').show();
    $('.showTrannyRetMsg').hide();
    $('.loadingTrannyMessage').show();
    $.post('enteringtrannies.php', obj, function (data, status) {
        var jsonMsgData = JSON.parse(data);
        $('.loadingTrannyMessage').hide();
        $('.showTrannyRetMsg').show();
        $.each(jsonMsgData,
            function (i, v) {
                $('.showTrannyMessage[data-row=' + i + ']').find('.showTrannyRetMsg').html(v);
            }
        );
    });
};

function adjustColHeaderData() {
    LLG.getColIndex = {};
    $.each(LLG.colHeaderData, function (i, v) {
        LLG.getColIndex[v] = i;
    });
};

function toUpperAllowNull(obj){
	if(obj != null ){
		obj = String(obj).toUpperCase();
	}else{
		obj = '';
	}
	return obj;
};

function toUpperCompressAllowNull(obj){
	if(obj != null ){
		obj = String(obj).toUpperCase().replace(/ /g,'').replace(/-/g,'');
	}else{
		obj = '';
	}
	return obj;
};

function getCustomerinfoArrays(cu){
	$.post(LLG.url() + 'engineInfo.php', {t: '2',c: cu}, function (data, status) {
		LLG.CustomertagInfo = JSON.parse(data);
		$('#hiddenMainDiv').show();
		LLG.cont.handsontable('render');
	});
	
	$.post(LLG.url() + 'engineInfo.php', {t: 'noDrivetrainTags',c: cu}, function (data, status) {
		LLG.noDTCustomertagInfo = JSON.parse(data);
		LLG.cont.handsontable('render');
	});
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

function computeEngAndTrannyId(obj){
	var year,make,model,hp,torque
		,tmake,tmodel;
	
	$.each(obj,function(i,v){	
		year = toUpperAllowNull(v[LLG.getColIndex['Year']-1]);
		make = toUpperAllowNull(v[LLG.getColIndex['Engine Make']-1]);
		model = toUpperAllowNull(v[LLG.getColIndex['Engine Model']-1]);
		hp = toUpperAllowNull(v[LLG.getColIndex['HP']-1]);
		torque = toUpperAllowNull(v[LLG.getColIndex['Torque']-1]);
		
		tmake = toUpperCompressAllowNull(v[LLG.getColIndex['Tranny Make']-1]);
		tmodel = toUpperCompressAllowNull(v[LLG.getColIndex['Tranny Model']-1]);
		
		if(torque != ''
			&& LLG.allEngineInfo.hasOwnProperty(year) 
			&& LLG.allEngineInfo[year].hasOwnProperty(make) 
			&& LLG.allEngineInfo[year][make].hasOwnProperty(model) 
			&& LLG.allEngineInfo[year][make][model].hasOwnProperty(hp) 
			&& LLG.allEngineInfo[year][make][model][hp].hasOwnProperty(torque)
		){
			v.push( LLG.allEngineInfo[year][make][model][hp][torque] );
		}else{
			v.push(null);
		}
		
		if(tmodel != ''
			&& LLG.allTrannyInfoC.hasOwnProperty(tmake) 
    		&& LLG.allTrannyInfoC[tmake].hasOwnProperty(tmodel)
		){
			v.push( LLG.allTrannyInfoC[tmake][tmodel] );
		}else{
			v.push(null);
		}
		
	});
	
	return true;
};

function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
};