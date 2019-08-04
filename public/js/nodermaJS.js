$(document).ready(function () {
	if($('audio').length){
		marioLoad();
	}
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
	
	
	
	$('#watcherDialog').dialog({ 
		autoOpen: false,
		minWidth:800,
		minHeight:300,
		maxHeight:400,
		beforeClose: function(){
			if($('#watcherDialog').find('img').is(":visible")){
				if(!confirm('A command is running. This will close the window and cancel the command.')){
					return false;
				}
			}
			return true;
		}
	});
	
	$( '#watcherDialog' ).show();
	
	$('#sickBayDialog').dialog({ 
		autoOpen: false,
		minWidth:800,
		minHeight:300,
		maxHeight:400
	});
	$( '#sickBayDialog' ).show();
	
	closeDialogOnInit('#watcherDialog');
	closeDialogOnInit('#sickBayDialog');
	
	
	
	//This is our watcher handsontable container
	LLG.cont = $('#dataTable');
	LLG.urlIndex = 1;
	LLG.urlArray = ['http://ratchet.diagknowsys.com/','http://r1.diagknowsys.com/','http://r2.diagknowsys.com/','http://r3.diagknowsys.com/'];
	LLG.url = function(){
		LLG.urlIndex=(LLG.urlIndex+1)%LLG.urlArray.length;
		return LLG.urlArray[LLG.urlIndex];
	};
	
	$.post(LLG.url() + 'engineInfo.php', {
        t: '3'
    }, function (data, status) {
        //array that will hold all the engine info for quick validation of cells
        $.each(JSON.parse(data), function (key, value) {
            $('#customerNameSelector').append($("<option></option>").attr("value",
                value).text(key));
        });
    });
	
	LLG.genericTimer = {};
	
	/*
	Custom Renderers
	*/
	
	LLG.getHistoryRenderer = function (instance,td, row) {
				
		td.innerHTML = '<div style="text-align:center"><div class="genBut blueBut" title="check history">&nbsp;H&nbsp;</div></div>';
				
        return td;
    };
	
	LLG.rmaDetail = function (instance,td, row) {
		td.innerHTML = '<div style="text-align:center"><div class="genBut blueBut" title="check detail">&nbsp;D&nbsp;</div></div>';
				
        return td;
    };
	
	LLG.markInactive = function (instance,td, row) {
		var p = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Platformid']);
		
		$(td).parent().toggleClass( 'onRow', ( LLG.tableDataUpdate.hasOwnProperty(p) && LLG.tableDataUpdate[p]['m'] < 6 ) );
						
        td.innerHTML = '<div style="text-align:center"><div class="genBut blueBut" data-row="'+row+'" title="mark inactive">&nbsp;X&nbsp;</div></div>';
        return td;
    };
	
	LLG.tableDataUpdater = function (instance,td, row, col) {
		var e
		,p = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['rmaid']);

	/*	if(col < LLG.getColIndex['GPS']){
			obj = LLG.tableDataUpdate;
		}else if(col == LLG.getColIndex['vna']){
			obj = LLG.vna;
			vna = true;
		}else{
			obj = LLG.nodestatus;
			node = true;
		}*/
		
		if( LLG.tableDataUpdate.hasOwnProperty(p) ){
			e = Handsontable.helper.stringify(LLG.tableDataUpdate[p][colHeaderUpdate[col]]);
		}else{
			td.innerHTML = '';
			return td;
		}
		
	    td.innerHTML = e;        
		return td;
    };
	
	LLG.passFailUpdater = function (instance,td, row, col) {
		var e
		,p = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Platformid']);
		
		if( LLG.tableDataUpdate.hasOwnProperty(p) ){
			e = Handsontable.helper.stringify(LLG.tableDataUpdate[p][colHeaderUpdate[col]]);
		}else{
			td.innerHTML = '';
			return td;
		}
		
	    td.innerHTML = e;
	   
		if(e == 'Fail'){
			$(td).addClass('red');
		}
        
		return td;
    };
	
	LLG.rmaStatusRenderer = function (instance, td, row, col, prop, value, cellProperties) {
		var p = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['rmaid']);

		if( LLG.tableDataUpdate.hasOwnProperty(p) ){
			td.innerHTML = LLG.tableDataUpdate[p][colHeaderUpdate[col]];
		}
		Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
    };
	
    /*
	Some global variables
	*/
	colHeaderUpdate = ['r','o','c','s','m','i','n'];
    colHeaderData = ['rmaid','opendate','customername','status','component','serial','notes','hist','detail'];
    colHeaderDataActualNames = ['RMA #','Open Date','Customer','Status','Component','Serial','Notes','Hist','Detail'];

	/*
	create variable called LLG.getColIndex.  Allows lookup by key.  ex LLG.getColIndex['Platformid'] equals 0
	*/
    adjustColHeaderData();
	
	LLG.componentList = [];
	$.post('nodeRMAactions.php',{t:'getComponentList'},function(r){
		LLG.componentList = JSON.parse(r);
		renderDT();
	});
	
	LLG.statusList = [];
	$.post('nodeRMAactions.php',{t:'getStatusList'},function(r){
		LLG.statusList = JSON.parse(r);
		renderDT();
	});
	
	LLG.NodeSerialInfo = [];
	$.post('engineInfo.php',{t:'getSerials'},function(data,status){
		LLG.NodeSerialInfo=JSON.parse(data);
		LLG.NodeSerialInfo.unshift('N/A');
		renderDT();
	});
	
	//setup excel like table and render it
	$("#dataTable").handsontable({
			colHeaders: colHeaderDataActualNames,
			startCols: Object.keys(LLG.getColIndex).length,
			autoWrapRow: true,
			contextMenu: true,
			height:500,
			width: 1180,
			columnSorting:true,
			manualColumnResize: true,
			columns: [ {
				type: 'numeric',
				readOnly:true
			}, {//open date
				type: 'text',
				readOnly:true
			}, {//customer
				type: 'text',
				readOnly:true
			}, {
			//status
				renderer: myAutocompleteRenderer,
				editor: Handsontable.editors.AutocompleteEditor,
				source: function (query, process) {
					var r = LLG.statusList;
					process(r);
				},
				highlighter: colorHighlighter,
				strict: true,
				options: {
					items: 4 //`options` overrides `defaults` defined in bootstrap typeahead
				}
			}, {
			//component
				renderer: myAutocompleteRenderer,
				editor: Handsontable.editors.AutocompleteEditor,
				source: function (query, process) {
					var r = LLG.componentList;
					process(r);
				},
				highlighter: colorHighlighter,
				strict: true,
				options: {
					items: 4 //`options` overrides `defaults` defined in bootstrap typeahead
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
			}
			,{//notes
				renderer:LLG.tableDataUpdater,
				width:'290px'
			},{//databus
				renderer: LLG.getHistoryRenderer,
				readOnly:true,
				width:'32px'
       	 	},{//databus
				renderer: LLG.rmaDetail,
				readOnly:true,
				width:'42px'
       	 	}
			],
			beforeChange: function (changes, source) {
				if (source !== 'loadData') {
					if(changes[0][1] == LLG.getColIndex['notes']){
						var id = LLG.cont.handsontable('getDataAtCell',changes[0][0], LLG.getColIndex['rmaid'])
						,obj = LLG.tableDataUpdate;
						
						if( id != null && id != '' && obj.hasOwnProperty(id) ){
							obj[id]['n'] = changes[0][3];
							$.post('nodeRMAactions.php', {t: 'updateNotes', i: id, n:changes[0][3]});
						}
					}else if (changes[0][1] == LLG.getColIndex['status'] && changes[0][3] == 'Cancel'){
						if(!confirm('This will Cancel this RMA.')){
							return false;
						}
					}
				}
			},
			afterSelection: function (r,c,r2,c2) {
				if(c == c2){
					switch(c){
						case LLG.getColIndex['hist']:
						rmaGetHistory(r);
						break;
						
						case LLG.getColIndex['detail']:
						rmaGetDetail(r);
						break;
						
						case LLG.getColIndex['Commands']:
						sickButNodeCommands(r);
						break;
						
						case LLG.getColIndex['markInactive']:
						sickButMarkInactive(r);
						break;
						
						default:
						break;
					}
				}
			}
		});
	
    //Load orininal table data
    $.post('nodeRMAactions.php', {
        t: 'getRMAinfo'
    }, function (data, status) {
        //Original watcher data, will not change and contains platformid,customer,and usertag information
		//all other info is found in the updateWatcher object and is queried as the user scrolls the table
        LLG.tableData = JSON.parse(data);
		setTotalRows(LLG.tableData);

		if(typeof LLG.tableDataUpdate != 'object'){
			return;
		}else{
			$('#tableloading').hide();
        	$('#hiddenMainDiv').show();
			renderDT();
        	LLG.cont.handsontable('loadData',LLG.tableData);
			marioLoadStop();
		}
    });
	
	$.post('nodeRMAactions.php', {
		t: 'getUpdateRMAinfo'
	}, function (data, status) {
		//Holds all dynamic information found in the watcher table, EXCEPT the node status check info
		LLG.tableDataUpdate = JSON.parse(data);
		
		if(typeof LLG.tableData != 'object'){
			return;
		}else{
			$('#tableloading').hide();
        	$('#hiddenMainDiv').show();
			renderDT();
        	LLG.cont.handsontable('loadData',LLG.tableData);
			marioLoadStop();
		}
	});
	
	//Watcher gets updated every minute
	intervalTimers['updateRMA'] = null;
	clearInterval(intervalTimers['updateRMA']);
	
	intervalTimers['updateRMA'] = setInterval(function() {
		$.post('nodeRMAactions.php', {
        	t: 'getUpdateRMAinfo'
		}, function (data, status) {
			//array that will hold all the engine info for quick validation of cells
			LLG.tableDataUpdate = JSON.parse(data);
			renderDT();
			var obj = LLG.cont.handsontable('getInstance');
			
			//are we sorted...yes? update sort info and sort.
			//I'm leaving setTimeout in here to make it asynchronous, but can probably be removed
			if(typeof obj.sortColumn != 'undefined'){
				var col = obj.sortColumn, order = obj.sortOrder;
				if(col > LLG.getColIndex['rmaid'] && col <= LLG.getColIndex['customername']){
					if($('#searchgrid').val() != ''){
						watcherSearchFunction();
					}
					
					columnSortingFunction(col);
					LLG.cont.handsontable('getInstance').sort(col,order);
				}
			}else{
				if($('#searchgrid').val() != ''){
					watcherSearchFunction();
				}
			}
		});
	},60000);
	
	intervalTimers['getRMAinfo'] = null;
	clearInterval(intervalTimers['getRMAinfo']);
	
	intervalTimers['getRMAinfo'] = setInterval(function() {
		$.post('nodeRMAactions.php', {
        	t: 'getRMAinfo'
		}, function (data, status) {
			LLG.wSrch = JSON.parse(data);
			//force a serch to occur
		});
	},60000);
	
	//replace default columnSorting behavior to update dynamic rows in the sort array
	$(document).off('click','.columnSorting').on('click','.columnSorting', function(){
		var col = getColRealNameIndex[$(this).html()];
		if( col > LLG.getColIndex['customername'] && col <= LLG.getColIndex['notes'] ){
			columnSortingFunction(col);
		}
		LLG.cont.handsontable('getInstance').sort(col,LLG.cont.handsontable('getInstance').sortOrder);
	});
	
	$(document).off('click','.dialogbutton').on('click','.dialogbutton', function () {

		if( $(this).parent().find('img').css('display') != 'none'){
			return;
		}
		
		var p = $(this).data('p')
			,t = $(this).data('t')
			,$this = $(this);
			
			$this.parent().find('img').show();
			
			$.post(LLG.url() + 'nodeCommands.php',{'t':t,'p':p},function(r){
				$this.parent().parent().find('textarea').val(r);
				$this.parent().find('img').hide();
			});
        }
    );
	
	$('#createRMA').off('click').on('click', function () {

		var cid = $('#customerNameSelector').val();
		
		if(cid > 0){
			var cname = $('#customerNameSelector :selected').text();
			$.post('nodeRMAactions',{t:'createRMA',c:cid},function(r){
				if(r > 0){
					LLG.cont.handsontable('getInstance').alter('insert_row',0,1);
					LLG.cont.handsontable('getInstance').setDataAtCell(0,0,r);
					LLG.cont.handsontable('getInstance').setDataAtCell(0,LLG.getColIndex['opendate'],getRmaTime());
					LLG.cont.handsontable('getInstance').setDataAtCell(0,LLG.getColIndex['customername'],cname);
					LLG.cont.handsontable('getInstance').setDataAtCell(0,LLG.getColIndex['status'],'Open');
					LLG.cont.handsontable('getInstance').setDataAtCell(0,LLG.getColIndex['component'],'On-Board Computer (OBC)');
					LLG.cont.handsontable('getInstance').setDataAtCell(0,LLG.getColIndex['serial'],'N/A');
					LLG.tableDataUpdate[r] = {n:'',s:'Open',m:'On-Board Computer (OBC)',i:'N/A'};
				}
			});
			$('#submitMessage').html('');
		}else{
			$('#submitMessage').css('color','red');
			$('#submitMessage').html('Select a customer to add an RMA');
		}
	});
	
	//search feature
	defaultSrchTxt = $('#searchgrid').val();
	$('#searchgrid').tooltip({ position: {my: "left bottom",at: "left top"}});
	$('#searchgrid').off('focus').on('focus',function(event){
		if($(this).val() == defaultSrchTxt){
			$(this).val('');
			$(this).css('color','#333333');
		}
	});
	$('#searchgrid').off('blur').on('blur',function(event){
		if($(this).val() == ''){
			$(this).val(defaultSrchTxt);
			$(this).css('color','#777777');
		}
	});
	
	var searchTimer;
	$('#searchgrid').off('keyup').on('keyup',function(event){
		clearTimeout(searchTimer);
		searchTimer = setTimeout(function(){watcherSearchFunction();},500);
	});
	
	$('#searchgrid').off('keydown').on('keydown',function(){
		clearTimeout(searchTimer);
	});
	
	
	$('#exportAllRows').off('click').on('click',function(){
		var data = LLG.cont.handsontable('getData',0,0,LLG.cont.handsontable('countRows'),LLG.getColIndex['Databus']),
		headers = LLG.cont.handsontable('getColHeader'),
		csv = '';
		
		for(var i=0;i<=LLG.getColIndex['Databus'];i++){
			csv += '"' +  headers[i] + '",';
		}
		
		csv = csv.slice(0,-1) +'\n';
		
		$.each(data,function(i,v){
			csv += '"' + data[i].join('","') + '"\n';
		});
		
		var a         = document.createElement('a');
		a.href        = 'data:attachment/csv,' + encodeURIComponent(csv);
		a.target      = '_blank';
		a.download    = 'SickBayExport.csv';
		
		document.body.appendChild(a);
		a.click();
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

//Rerendering is used everywhere, let's make it a function!
function renderDT(){
	LLG.cont.handsontable('render');
};

//Sorting with handsontable requires a lot of overhead. This removes that.
//I edited handsontable js and added a global variable called RUNafterChangesObserved
//You will get bugs if you update handsontable without including this variable
//in the source code!!! ask MDJ
function columnSortingFunction(colIndex){
	LLG.cont.handsontable('getInstance').observeChangesActive = false;
	RUNafterChangesObserved = false;
	
	$.each(LLG.cont.handsontable('getInstance').observedData,function(i,v){
		if(v[0]!=null){
			v[colIndex] = LLG.tableDataUpdate[v[0]][colHeaderUpdate[colIndex]];
		}
	});
	
	LLG.cont.handsontable('getInstance').observer.object = LLG.cont.handsontable('getInstance').observedData;
};

function watcherSearchFunction(){
	var dt = LLG.cont
	,value = escapeRegExp($('#searchgrid').val())
	,searcharray = []
	,data = LLG.tableData,row,col,r_len,c_len,d,lbreak = false,tempTester = {}
	,fastSearch = false
	,queryRegex
	,searchWatcher = [];
	
	if(value == defaultSrchTxt){value = '';}
	
	if(value.indexOf(',') > -1){
		//we have a super search in place
		/*fastSearch = true;
		value = trim1(value.toUpperCase()).replace(/ {2,}/g,' ').replace(/ {0,}[,] {0,}/g, ',').split(',');
		$.each(value,function(i,v){
			if(LLG.fastSrchArray.platformid.hasOwnProperty(v)){
				searcharray.push(data[LLG.fastSrchArray.platformid[v]]);
			}else if(LLG.fastSrchArray.customer.hasOwnProperty(v)){
				$.each(LLG.fastSrchArray.customer[v],function(j,y){
					searcharray.push(data[y]);
				});
			}else if(LLG.fastSrchArray.usertag.hasOwnProperty(v)){
				$.each(LLG.fastSrchArray.usertag[v],function(j,y){
					searcharray.push(data[y]);
				});
			}
		});*/
		fastSearch = true;
		value = trim1(value.toUpperCase()).replace(/ {2,}/g,' ').replace(/ {0,}[,] {0,}/g, ',').split(',');
		value = removeDuplicates(value);
		
		if(typeof(LLG.wSrch) != 'undefined'){
			searchWatcher = LLG.wSrch.slice(0);
		}else{
			searchWatcher = LLG.tableData.slice(0);
		}
		for(var j=0;j<=LLG.getColIndex['notes'];j++){
			$.each(value,function(i,v){
				queryRegex = new RegExp('(^)'+v+'($)', 'i');
				
				searcharray.push.apply(searcharray,searchWatcher.filter(function(choice){
				  return queryRegex.test(choice[j]);
				}));
			});
		}
	}else if(value.indexOf(';') > -1){
		//we have a super search in place
		fastSearch = true;
		value = trim1(value.toUpperCase()).replace(/ {2,}/g,' ').replace(/ {0,}[;] {0,}/g, ';').split(';');
		value = removeDuplicates(value);
		
		var returnArray = [];
		
		if(typeof(LLG.wSrch) != 'undefined'){
			searcharray = LLG.wSrch.slice(0);
		}else{
			searcharray = LLG.tableData.slice(0);
		}
		
		$.each(value,function(i,v){
			queryRegex = new RegExp(v, 'i');
			
			returnArray = searcharray.slice(0);
			searcharray = [];
			searcharray.push.apply(searcharray,returnArray.filter(function(choice){
			  return queryRegex.test(choice);
			}));
		});
	}else{
		
		value = trim1(value.replace(/\s+/g, " ").toUpperCase()).split(' ');
		
		value = removeDuplicates(value);
	}
	
	if(fastSearch){
		searcharray = removeDupSrchArr(searcharray);
		setTotalRows(searcharray);
		dt.handsontable('loadData',searcharray);
	}else if(value.length){				
		
		if(typeof(LLG.wSrch) != 'undefined'){
			searchWatcher = LLG.wSrch.slice(0);
		}else{
			searchWatcher = LLG.tableData.slice(0);
		}
		
		$.each(value,function(i,v){
			queryRegex = new RegExp(v, 'i');
			searcharray.push.apply(searcharray,searchWatcher.filter(function(choice){
			  return queryRegex.test(choice);
			}));
		});
		
		searcharray = removeDupSrchArr(searcharray);

		setTotalRows(searcharray);
		dt.handsontable('loadData',searcharray);
	}
	else{
		setTotalRows(data);
		dt.handsontable('loadData', data);
	}
};

function removeDuplicates(array){
	var t = {};
	
	$.each(array,function(i,v){
		t[v] = i;
	});
	
	array = [];
	
	$.each(t,function(i,v){
		array.push(i);
	});
	
	return array;
};

function removeDupSrchArr(array){
	var t = {};
	
	$.each(array,function(i,v){
		t[v[0]] = v;
	});
	
	array = [];
	
	$.each(t,function(i,v){
		array.push(v);
	});
	
	return array;
};

function setTotalRows(obj){
	$('#totalRows').html(numberWithCommas(Object.keys(obj).length));
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

function nodeCommandDivs(buttontext, command, p , butid){
	return '<div><div style="float:right"><textarea style="width:300px;font-size:11px;"></textarea></div><div style="float:right;padding:10px"><div id="'+butid+'" class="blueBut dialogbutton" data-p="' + p + '" data-t="' + command + '" style="font-size:12px;padding:3px">' + buttontext + '</div><br><br><img style="display:none" src="images/loadingRow.gif"> </div><div style="clear:both"></div></div>';
};

function closeDialogOnInit(id){
	if ($(id).hasClass('ui-dialog-content')) {
		$(id).dialog('close');
	}
};

function rmaGetHistory(row){
	var pl = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['rmaid'])
		//,u = LLG.tableDataUpdate[pl]['u']
		,c = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['customername']);
		
		$('#sickBayDialog').html('<div style="text-align:center;padding-top:100px"><img src="images/blank_loading75.gif" /></div>');
		$('#sickBayDialog').load(LLG.url()+ 'engineInfo.php',{t: 'getRMAHistory',p: pl});
		$('#sickBayDialog').dialog('option','title', 'History for ' + c + ' RMA#: ' + pl );
		$('#sickBayDialog').dialog('open');
};

function rmaGetDetail(row){
	var pl = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['rmaid'])
		//,u = LLG.tableDataUpdate[pl]['u']
		,c = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['customername']);
		
		$('#sickBayDialog').html('<div style="text-align:center;padding-top:100px"><img src="images/blank_loading75.gif" /></div>');
		$('#sickBayDialog').dialog('option','title', 'RMA Detail for ' + c + ' RMA#: ' + pl );
		$('#sickBayDialog').dialog('open');
		
		$.post('nodeRMAactions.php',{t:'getRMADetail',r:pl},function(data, status){
			var rmaDetail = JSON.parse(data)
			,div = ''
			,j=1
			,rmaid;
			$.each(rmaDetail, function (i, v) {
				if(j){
					rmaid = v;
					j=0;
				}else{
					div +='<div><div class="rmadetailtypediv" data-rmaid="' + rmaid + '" data-type="' + i + '" style="font-weight:bold;width:150px;text-align:right;float:left">' + i + ': </div> <div class="rmadetaildiv" data-rmaid="' + rmaid + '" data-column="'+i+'" style="float:left">' + v + '</div><div style="clear:both"></div></div>';
				}
			})
			
			div = '<div style="width:500px;text-align:left">' + div + '</div>';
			
			$('#sickBayDialog').html(div);
			
			$('div.rmadetaildiv').off('click').on('click',function(){

				if( !$(this).find('input').length ){
					var input;
					var col = $(this).data('column').toUpperCase();
					
					if(col.indexOf('DATE') > -1){
						input = '<input class="rmadetailinput rmaDDP" style="width:200px" type="text" value="' + $(this).html() + '" />';
						$(this).html(input);
						
						setTimeout(function(){
							$('.rmaDDP').datepicker({onClose:function(selectedDate){
								var type = $('.rmaDDP').parent().data('column'),
								rmaid = $('.rmaDDP').parent().data('rmaid');
								
								console.log( $('.rmaDDP').parent().data('rmaid'));
								
								$('.rmaDDP').parent().html(selectedDate);
								
								var ts = new Date(selectedDate);
								ts = ts.getTime();
								
								$.post('nodeRMAactions.php',{t:'setDetailValue',r:rmaid,v:ts,c:type},function(data, status){
									console.log(data);
								});
							}});
							
							$('.rmadetailinput').focus();
						},0);
						
					}else if(col == 'RMASTATUS'){
						input = '<input class="rmadetailinput rmastatusac" onblur="rmaDetailBlur(this,\'\');" style="width:200px" type="text" value="' + $(this).html() + '" />';
						$(this).html(input);
						
						setTimeout(function(){
							$('.rmastatusac').autocomplete({
								minLength: 0
								,source:function(req, resp) {
									resp(LLG.statusList);
								}
								,focus: function() {
									$(this).autocomplete("search", "");
								}
								,select:function(e,ui){
									$('.rmastatusac').val(ui.item.value);
									rmaDetailBlur($('.rmastatusac'));
								}
							});
							
							$('.rmadetailinput').focus();
							$('.rmastatusac').autocomplete("search", "");
						},0);
						
					}else if(col == 'COMPONENT'){
						input = '<input class="rmadetailinput rmacompac" style="width:200px" type="text" value="' + $(this).html() + '" />';
						$(this).html(input);
						
						setTimeout(function(){
							$('.rmacompac').autocomplete({
								minLength: 0
								,source:function(req, resp) {
									resp(LLG.componentList);
								}
								,focus: function() {
									$(this).autocomplete("search", "");
								}
								,select:function(e,ui){
									$('.rmacompac').val(ui.item.value);
									rmaDetailBlur($('.rmacompac'));
								}
							});
							
							$('.rmadetailinput').focus();
							$('.rmacompac').autocomplete("search", "");
						},0);
						
					}else{
						input = '<input onblur="rmaDetailBlur(this,\'\');" class="rmadetailinput" style="width:200px" type="text" value="' + $(this).html() + '" />';
						$(this).html(input);
						$('.rmadetailinput').focus();
					}
	
/*					$('.rmadetailinput').off('blur').one('blur',function(){
						$(this).parent().html($(this).val());
					});*/
				}
			});
			
		});
};

function rmaDetailBlur(obj,t){
	
	if(t == 'd' && $('.rmaDDP').datepicker( "widget" ).is(":visible")){
		return;
	}
	
	var type = $(obj).parent().parent().find('.rmadetailtypediv').data('type'),
	rmaid = $(obj).parent().parent().find('.rmadetailtypediv').data('rmaid'),
	val = $.trim($(obj).val());
	
	if(val == ''){
		val = 'null';
	}

	$(obj).parent().html(val);
	
	$.post('nodeRMAactions.php',{t:'setDetailValue',r:rmaid,v:val,c:type},function(data, status){
		console.log(data);
	});
};

function removeRMATextBoxes(){
	$('div.rmadetailspan').each(function(){
		$(this).html($(this).find('input').val());
	});
};
  
function sickButNodeCommands(row){
		if( LLG.tableDataUpdate[LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Platformid'])]['m'] > 5  ){return;}
	
		if($('#watcherDialog').dialog('isOpen')){
			if($('#watcherDialog').find('img').is(":visible")){
				if(!confirm('A command is running. This will close the window and cancel the command.')){
					return false;
				}
			}
		}
		
		var p = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Platformid'])
			,u = LLG.tableDataUpdate[p]['u']
			,c = LLG.tableDataUpdate[p]['c'];
			$('#watcherDialog').html('<div id="activatehelp" data-on="false">CLICK THIS LINK! you will notice this link in many places on Liban Labs (hover over buttons after clicking) ---------> turn on help tips</div>' + nodeCommandDivs('What is my drivetrain?','drivetrain', p,'ncddt') 
										+ nodeCommandDivs('What are my platform parameters?','platformParameters', p,'ncdpp')
										+ nodeCommandDivs('Force Software Upgrade (HOS safe)','upgradeDist', p,'ncdud')
										+ nodeCommandDivs('Disable Display','displayDisable', p,'ncddd')
										+ nodeCommandDivs('Enable Display','displayEnable', p,'ncded'));
			$('#watcherDialog').dialog( 'option','title', 'Commands for ' + c + ' Vehicle: ' + u + ' (' + p + ')' );
			$('#watcherDialog').dialog('open');	
};

function sickButMarkInactive(row){
			var platform = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['Platformid']);
			
			if(confirm('This will remove this truck from the SickBay Tool. Usually only use this if the truck is inactive.')){
				LLG.cont.handsontable('alter','remove_row',row);
				$.post(LLG.url()+ 'engineInfo.php', {t: 'markInactive',p: platform});
			}
};

function getRmaTime(){
	var d = new Date()
	,dt = d.getDate()
	,m = d.getMonth() + 1
	,y = d.getFullYear().toString().substring(2,4)
	,h = d.getHours()
	,mi = d.getMinutes();
	m = (m < 10) ? '0' + m : m;
	mi = (mi < 10) ? '0' + mi : mi;
	
	dt = (dt < 10) ? '0' + dt : dt;
	
	return m + '/' + dt + '/20' + y + ' ' + ((h>12) ? h-12 : h) + ':' + mi + ((h>11) ? ' pm' : ' am');

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

    td.title = 'Type to show the list of options';
    var error = false;
    var title = '';
	var allowed;
	var p;
	
    clearHighlightError(td);
	
    if (value == null || value == '') {
		setNewRmaDropDown('',allowed,td,row,col,value,true);
        return;
    }
	
    switch (col) {
    case LLG.getColIndex['status']:
		allowed = LLG.statusList;
        if (allowed.indexOf(value) == -1) {
            error = true;
            title = 'What did you enter?';
        }else{
			setNewRmaDropDown('setStatus',allowed,td,row,col,value,false);
			
			if(value == 'Cancel'){
				LLG.cont.handsontable('getInstance').alter('remove_row',row);
			}
			
		}
        break;
	
	case LLG.getColIndex['component']:
	allowed = LLG.componentList;
        if (allowed.indexOf(value) == -1) {
            error = true;
            title = 'What did you enter?';
        }else{
			setNewRmaDropDown('setComponent',allowed,td,row,col,value,false);
		}
        break;
		
	case LLG.getColIndex['serial']:
	allowed = LLG.NodeSerialInfo;
        if (allowed.indexOf(value) == -1) {
            error = true;
            title = 'What did you enter?';
        }else{
			setNewRmaDropDown('setSerial',allowed,td,row,col,value,false);
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

function setNewRmaDropDown(type,allowed,td,row,col,value,skip){
	var r = LLG.cont.handsontable('getDataAtCell',row, LLG.getColIndex['rmaid']);

	if( LLG.tableDataUpdate.hasOwnProperty(r) ){
		
		if(skip){
			td.innerHTML = LLG.tableDataUpdate[r][colHeaderUpdate[col]];
			return;
		}
		
		if(value == LLG.tableDataUpdate[r][colHeaderUpdate[col]]){
			return;
		}else{
			LLG.tableDataUpdate[r][colHeaderUpdate[col]] = value;
			//now we need to set the status
			$.post('nodeRMAactions.php', {t: type,p: r, s:value});
		}
	}
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
    LLG.cont.handsontable('getCell',
        row, col).className = 'handserror';
    LLG.cont.handsontable('getCell',
        row, col).title = title;
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