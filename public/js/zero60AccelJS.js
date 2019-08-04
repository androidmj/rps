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
	
	Highcharts.setOptions({
		legend:{
			borderWidth: 1,
			backgroundColor: '#FFFFFF',
			shadow:true
		}
	});
	
	$(document).off('click','.chchartWidth,.chchartHeight')
		.on('click','.chchartWidth,.chchartHeight' ,
		function() {
			var id = $(this).attr('class').split(' ')[1].substring(2);
			var val = parseInt($('#'+id).val());
			if($(this).data('op') == '-'){
				$('#'+id).val(val-10);
			}else{
				$('#'+id).val(val+10);
			}
		}
	);
	
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
                $.post('engineInfo.php',{t:'allVeh',c:cu},function(data,status){
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

    var graphRequests = {};

    var loadGraph = function(row,platformId,vehicleTag, data) {
    	var el = $( '#zero60Accel' );
    	
    	var minTime = parseFloat(data[0].time), maxTime = 0;

    	var map = [];

    	for (inst in data) {
    		maxTime = data[inst].time;
    		map[map.length] = [Math.round((data[inst].time - minTime) / 1000),data[inst].kph * 0.621371];
    	}

    	minTime = new Date(minTime);
    	maxTime = new Date(parseFloat(maxTime));
		
		var formattedMinTime = minTime.toString();

		var chart = createZero60Chart(map,vehicleTag,formattedMinTime,maxTime);

		graphRequests[platformId] = [];

    	graphRequests[platformId][0] = $.post('zero60AccelCreate.php', {
            c: $('#customerNameSelector').val(),
            p: platformId,
            r: 'actualRPM',
			starttime: minTime.getTime(),
			endtime: maxTime.getTime()
        });

		graphRequests[platformId][0].done(function(data){
        	data = $.parseJSON(data);

        	chart.addSeries({
        		name: 'Actual RPM',
        		data: data,
        		color: 'red',
        		zIndex: 2,
        		yAxis: 0
        	})
		})

    	graphRequests[platformId][1] = $.post('zero60AccelCreate.php', {
            c: $('#customerNameSelector').val(),
            p: platformId,
            r: 'idealRPM',
			starttime: minTime.getTime(),
			endtime: maxTime.getTime()
        });

        graphRequests[platformId][1].done(function(data){
        	data = $.parseJSON(data);

        	chart.addSeries({
        		name: 'Ideal RPM',
        		data: data,
        		color: 'green',
        		zIndex: 3,
        		yAxis: 0
        	});
        });

        graphRequests[platformId][2] = $.post('zero60AccelCreate.php',{
            c: $('#customerNameSelector').val(),
            v: vehicleTag,
            r: 'rangeRPM'
        });

        graphRequests[platformId][2].done(function(data) {
        	data = $.parseJSON(data);

        	chart.yAxis[0].setExtremes(500, data.maxRPM + 100);

        	chart.addSeries({
        		name: 'Shift Range',
        		type: 'arearange',
        		data: [[0, data.lowRPM,data.highRPM],[(maxTime.getTime() - minTime.getTime()) / 1000,data.lowRPM,data.highRPM]],
        		zIndex: 0,
        		yAxis: 0
        	});
        });
    };
	
	$(document).off('click','.findEvents')
		.on('click','.findEvents', function () {
            var row = $(this).data('row'),
                vehicle = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Vehicle ID']);
            if (vehicle == '' || vehicle == null) {
                alert('Enter a Truck ID');
            } else {

            	for (var requestPlatform in graphRequests) {
            		for (var requestCounter in graphRequests[requestPlatform]) {
            			if (graphRequests[requestPlatform][requestCounter].readyState != 4) {
            				graphRequests[requestPlatform][requestCounter].abort();
            			}
            			delete graphRequests[requestPlatform][requestCounter];
            		}
            		delete graphRequests[requestPlatform];
            	}

                var th = $(this),
                    loadgif = $('.loadCurrentSettings[data-row="' + row + '"]');
                th.hide();
                loadgif.show();

                var vehicleTag = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Vehicle ID']);

				$.post('zero60AccelCreate.php', {
                    c: $('#customerNameSelector').val(),
                    v: vehicleTag,
					d: LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Dates']),
					r: 'kph'
                },function(data){
					$( '#zero60Accel' ).empty();
					$(document).off("click","#setChartDim" );
					data = $.parseJSON(data);

					var platformId = Object.keys(data)[0];
					data = data[platformId];

					for ( inst in data) {
						loadGraph(row, platformId, vehicleTag, data[inst]);
					}

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

function createZero60Chart(data,vehicle,formattedTime,maxTime){
	var r = randomString();
	var $div = $("<div>", {id: r, class: "zero60Chart"});
		
	$("#zero60Accel").append($div);
	
	var c = {
		chart: {
			renderTo: r,
			type: 'line',
			height:$('#chartHeight').val(),
			width:$('#chartWidth').val()
		},
		credits:{
			enabled:false
		},
		title: {
			text: 'Ideal Shift - Vehicle ' + vehicle
		},
		subtitle: {
			text: formattedTime
		},
		plotOptions:{
			line:{
				marker:{
					enabled:false,
					states:{
						hover:{
							radius:3
						}
					},
					symbol:'circle'
				}
			},
			arearange:{
				fillColor:'rgba(192, 192, 192, 0.3)'
			}
		},
		xAxis: {
			min:0,
			title: {
				text: 'Seconds'
			},
			gridLineWidth:1,
			maxPadding:0
		},
		yAxis: [{
        		min: 500,
				max: 2000,
				title: {
					text: 'RPM'
				},
				startOnTick: false,
				endOnTick: false,
				lineWidth:1,
				gridLineWidth: 1,
				minorTickInterval:'auto',
				id:'mph'
			},{
				min: 0,
				max:60,
				title: {
					text: 'MPH'
				},
				startOnTick: false,
				endOnTick: false,
				lineWidth:1,
				gridLineWidth: 0,
				opposite: true
			}],
		tooltip: {
			formatter: function() {
				return Highcharts.numberFormat(this.x,0) + ' Seconds<br>' + Highcharts.numberFormat(this.y,0) + ' ' + this.series.name;
			},
			positioner: function () {
				return { x: 0, y: 0 };
			}
		},
		series: [
		{
			yAxis: 1,
			name: 'MPH',
			data: data,
			color: 'black',
			zIndex:1
		}
		],
		navigation: {
			buttonOptions: {
				height:20,
				width: 20,
				symbolSize: 10,
				symbolX: 10,
				symbolY: 10,
				symbolStrokeWidth: 1
			}
		},
		exporting: {
			buttons: {
				exportButton: {
					x: -20
				},
				printButton: {
					x: -45
				}
			},
			scale:3
		},
		legend: {
			align:'right',
			verticalAlign:'bottom',
			y:-50,
			x:-55,
			floating:true
		}
	};
	
  chart = new Highcharts.Chart(c,function(chart,r){
	  $(document).on('click','#setChartDim' ,
	    function(e) {
	      chart.setSize($('#chartWidth').val(),$('#chartHeight').val());
	      if(typeof maxRPM != "undefined"){
          chart.get('mph').setExtremes(0, maxRPM);
	      }
	    }
	  );
  });


	return chart;
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