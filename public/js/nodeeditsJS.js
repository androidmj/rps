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
	LLG.is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
	
	//This is our watcher handsontable container
	LLG.cont = $('#dataTable');
	LLG.hwcont = $('#hwTable');
	LLG.urlIndex = 1;
	LLG.urlArray = ['http://ratchet.diagknowsys.com/','http://r1.diagknowsys.com/','http://r2.diagknowsys.com/','http://r3.diagknowsys.com/'];
	LLG.url = function(){
		LLG.urlIndex=(LLG.urlIndex+1)%LLG.urlArray.length;
		return LLG.urlArray[LLG.urlIndex];
	};
	
	LLG.genericTimer = {};
	
	/*
	Custom Renderers
	*/
   	
	LLG.watcherUpdater = function (instance,td, row, col, prop, value, cellProperties) {
		var e
		,p = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid']);
		
		if( LLG.watcherUpdate.hasOwnProperty(p) ){
			td.innerHTML = LLG.watcherUpdate[p][colHeaderUpdate[col]];
			return td;
		}
		
		td.innerHTML = '';
		return td;
    };
	
	LLG.hwcont.handsontable({
		colHeaders: ['hw Sku','Dist','Components','Description'],
		startCols: 4,
		autoWrapRow: true,
		contextMenu: false,
		width: 1180,
		columnSorting:true,
		startRows:1,
		columns: [ {
			type: 'numeric',
			readOnly:true
		}, {
			type: 'text',
			readOnly:true
		},{
			type: 'text',
			readOnly:true
		},{
			type: 'text',
			readOnly:true
		}]
	});
	
	/*
	Some global variables
	*/
	colHeaderUpdate = ['s','p','n','h'];
    colHeaderData = ['serialNumber','platformid', 'nodeId', 'hw','dist'];
    colHeaderDataActualNames = ['Node Serial','Platformid', 'Node Id','HW Sku','Dist'];

	/*
	create variable called getColIndex.  Allows lookup by key.  ex getColIndex['Platformid'] equals 0
	*/
    adjustColHeaderData();
	
	//setup excel like table and render it
	LLG.cont.handsontable({
		colHeaders: colHeaderDataActualNames,
		startCols: Object.keys(getColIndex).length,
		autoWrapRow: true,
		contextMenu: true,
		width: 1180,
		columnSorting:true,
		manualColumnResize: true,
		startRows:1,
		minSpareRows:1,
		columns: [ {
			type: 'text'
		}, {
			type: 'numeric'
		},{
			type: 'numeric'
		},{
			type: 'numeric'
		},{
			type: 'text'
		}],
		afterChange: function (changes, source) {
            if (changes != null) {
				var col,adjacentVal,
				$obj = LLG.cont;
                for (var i = changes.length - 1; i >= 0; i--) {
                    col = changes[i][1];
					
					switch(col){
						case getColIndex['serialNumber']:
						var row = changes[i][0],
                            value = toUpperAllowNull(changes[i][3]);
                        if (value != '' && LLG.hwLookup.hasOwnProperty(value)) {
							adjacentVal =  toUpperAllowNull($obj.handsontable('getDataAtCell',row,getColIndex['platformid']));
							if(adjacentVal != LLG.hwLookup[value]['p']){
								$obj.handsontable('setDataAtCell',row,getColIndex['platformid'],LLG.hwLookup[value]['p']);
							}
							
							adjacentVal =  toUpperAllowNull($obj.handsontable('getDataAtCell',row,getColIndex['nodeId']));
							if(adjacentVal != LLG.hwLookup[value]['n']){
								$obj.handsontable('setDataAtCell',row,getColIndex['nodeId'],LLG.hwLookup[value]['n']);
							}
							
							adjacentVal =  toUpperAllowNull($obj.handsontable('getDataAtCell',row,getColIndex['hw']));
							if(adjacentVal != LLG.hwLookup[value]['h']){
								$obj.handsontable('setDataAtCell',row,getColIndex['hw'],LLG.hwLookup[value]['h']);
							}
							
							adjacentVal =  toUpperAllowNull($obj.handsontable('getDataAtCell',row,getColIndex['dist']));
							if(adjacentVal != LLG.hwLookup[value]['d']){
								$obj.handsontable('setDataAtCell',row,getColIndex['dist'],LLG.hwLookup[value]['d']);
							}
                        }
						break;
						
						default:
						break;
					}
                }
            }
        }
	});
	
	
	
	$.post(LLG.url()+ 'engineInfo.php', {t: 'getHwSku'}, function (data, status) {
		//Holds all dynamic information found in the watcher table, EXCEPT the node status check info
		$('#libanlabsloading').hide();
		marioLoadStop();
		$('#hiddenMainDiv').show();
		LLG.hwSkus = JSON.parse(data);
		LLG.hwcont.handsontable('loadData',LLG.hwSkus);
		renderDT();
	});
	
	$.post(LLG.url()+ 'engineInfo.php', {t: 'getHwSkuLookup'}, function (data, status) {
		//Holds all dynamic information found in the watcher table, EXCEPT the node status check info
		LLG.hwLookup = JSON.parse(data);
	});
	
	$('#submitNodeInfo').off('click').on('click',function(){
		var h = LLG.cont,
			d = h.handsontable('getData', 0, LLG.getColIndex['dist'], h.handsontable('countRows') - 2, h.handsontable('countCols') - 1);
			
		var obj = {
				'data': d,
				't': 'setNodeInfo'
			};
			
		$.post(site, {'data': d,'t': 'setNodeInfo'}, function (data, status) {	
			
		});
	});
    //Load orininal table data
    //$.post(LLG.url()+ 'engineInfo.php', {
//        t: 'getWatcher'
//    }, function (data, status) {
//        //Original watcher data, will not change and contains platformid,customer,and usertag information
//		//all other info is found in the updateWatcher object and is queried as the user scrolls the table
//        LLG.watcher = JSON.parse(data);
//		setTotalRows(LLG.watcher);
//		
//		/*LLG.fastSrchArray = {'platformid':{},'customer':{},'usertag':{}};
//		$.each(LLG.watcher,function(i,v){
//			LLG.fastSrchArray.platformid[v[0]]=i;
//			if(typeof(LLG.fastSrchArray.customer[v[1]]) == 'undefined'){
//			 LLG.fastSrchArray.customer[v[1]] = [];
//			}
//			LLG.fastSrchArray.customer[v[1]].push(i);
//			if(typeof(LLG.fastSrchArray.usertag[v[2]]) == 'undefined'){
//			 LLG.fastSrchArray.usertag[v[2]] = [];
//			}
//			LLG.fastSrchArray.usertag[v[2]].push(i);
//		});*/
//		
//		if(typeof LLG.watcherUpdate != 'object'){
//			return;
//		}else{
//			$('#watcherloading').hide();
//			$('#hiddenMainDiv').show();
//			renderDT();
//        	LLG.cont.handsontable('loadData',LLG.watcher);
//			marioLoadStop();
//		}
//    });
//	
//	$.post(LLG.url()+ 'engineInfo.php', {
//		t: 'updateWatcher'
//	}, function (data, status) {
//		//Holds all dynamic information found in the watcher table, EXCEPT the node status check info
//		LLG.watcherUpdate = JSON.parse(data);
//		
//		if(typeof LLG.watcher != 'object'){
//			return;
//		}else{
//			$('#watcherloading').hide();
//        	$('#hiddenMainDiv').show();
//			renderDT();
//        	LLG.cont.handsontable('loadData',LLG.watcher);
//			marioLoadStop();
//		}
//	});
	
	//Watcher gets updated every minute
	//intervalTimers['updateWatcher'] = null;
//	clearInterval(intervalTimers['updateWatcher']);
//	
//	intervalTimers['updateWatcher'] = setInterval(function() {
//		$.post(LLG.url()+ 'engineInfo.php', {
//        	t: 'updateWatcher'
//		}, function (data, status) {
//			//array that will hold all the engine info for quick validation of cells
//			LLG.watcherUpdate = JSON.parse(data);
//			renderDT();
//			var obj = LLG.cont.handsontable('getInstance');
//			
//			//are we sorted...yes? update sort info and sort.
//			//I'm leaving setTimeout in here to make it asynchronous, but can probably be removed
//			if(typeof obj.sortColumn != 'undefined'){
//				var col = obj.sortColumn, order = obj.sortOrder;
//				if(col > getColIndex['Platformid'] && col < getColIndex['Connect']){
//					if($('#searchgrid').val() != ''){
//						watcherSearchFunction();
//					}
//					
//					columnSortingFunction(col);
//					LLG.cont.handsontable('getInstance').sort(col,order);
//				}
//			}else{
//				if($('#searchgrid').val() != ''){
//					watcherSearchFunction();
//				}
//			}
//		});
//	},60000);
//	
//	intervalTimers['getWatcher'] = null;
//	clearInterval(intervalTimers['getWatcher']);
//	
//	intervalTimers['getWatcher'] = setInterval(function() {
//		$.post(LLG.url()+ 'engineInfo.php', {
//        	t: 'getWatcher'
//		}, function (data, status) {
//			LLG.wSrch = JSON.parse(data);
//			//force a serch to occur
//		});
//	},60000);
	
	//replace default columnSorting behavior to update dynamic rows in the sort array
	//$(document).off('click','.columnSorting').on('click','.columnSorting', function(){
//		var col = getColRealNameIndex[$(this).html()];
//		if( col > getColIndex['Platformid'] && col < getColIndex['Connect'] ){
//			columnSortingFunction(col);
//		}
//		LLG.cont.handsontable('getInstance').sort(col,LLG.cont.handsontable('getInstance').sortOrder);
//	});
//
//	//Check all visible statuses at once
//	$(document).off('click','#checkAllStatus').on('click','#checkAllStatus', function(){
//		$('.nodeStatus').click();
//	});

//	Let's check the  OBC status
	//LLG.nodestatus = Array();
//	LLG.genericTimer.nodestatus = false;
//	$(document).off('click','.nodeStatus').on('click','.nodeStatus', function () {
//			var platform = LLG.cont.handsontable('getDataAtCell',$(this).data('row'), getColIndex['Platformid'])
//			
//			var th = $(this),
//                loadgif = $('.loadNodeStatus[data-row="' + th.data('row') + '"]');
//                th.hide();
//                loadgif.show();
//			
//			LLG.nodestatus[platform] = {'pending':true
//									,'gps':''
//									,'j1939':''
//									,'j1708':''
//									,'display':''
//									,'serial':''};
//			
//			$.post(LLG.url()+ 'engineInfo.php', {t: 'getNodeStatus',p: platform}, function (data, status) {
//				var obj = JSON.parse(data);
//				LLG.nodestatus[obj['platformid']] 	= {'pending':false
//													,'gps':obj['gps']
//													,'j1939':obj['j1939']
//													,'j1708':obj['j1708']
//													,'display':obj['display']
//													,'serial':obj['serial']};
//				//super slow for user if we don't spread the renderings out.
//				if(LLG.genericTimer.nodestatus == false || $.active < 3){
//					LLG.genericTimer.nodestatus = true;
//					setTimeout(function(){renderDT();LLG.genericTimer.nodestatus = false;},2000);
//				}
//			});
//        }
//    );
	
	LLG.helpTitles = [
					{
						'id':'#ncddt',
						'title':'Returns the drivetrain file from the OBC. If a file is returned, the vehicle has a drivetrain.'
					},{
						'id':'#ncdpp',
						'title':'Returns the platform parameters file from the OBC. These are the exact parameter settings on this OBC right now.'
					},{
						'id':'#ncdud',
						'title':'You can run this on HOS vehicles too. Will upgrade an OBC to a new distribution if it is at a lower distribution. You can run this immediately after changing the dist in the database. You DO NOT need to edit the sources.d.list file, this tool takes care of everything!'
					}
				];
	initHelpTips();
	
	//LLG.vna = Array();
//	LLG.genericTimer.vna = false;
//	$(document).off('click','.flashVNA').on('click','.flashVNA', function () {
//		var platform = $(this).data('platformid');
//		
//		var th = $(this),
//			loadgif = $('.loadflashVNA[data-platformid="' + platform + '"]');
//			th.hide();
//			loadgif.show();
//		
//		LLG.vna[platform] = {'pending':true
//								,'vna':''};
//		
//		$.post(LLG.url()+ 'engineInfo.php', {t: 'watcherVNAflash',p: platform}, function (data, status) {
//			var obj = JSON.parse(data);
//			LLG.vna[obj['platformid']] 	= {'pending':false
//												,'vna':obj['vna']};
//			//super slow for user if we don't spread the renderings out.
//			if(LLG.genericTimer.vna == false || $.active < 3){
//				LLG.genericTimer.vna = true;
//				setTimeout(function(){renderDT();LLG.genericTimer.vna = false;},2000);
//			}
//		});
//	});
//	
//	$(document).off('click','.dialogbutton').on('click','.dialogbutton', function () {
//
//		if( $(this).parent().find('img').css('display') != 'none'){
//			return;
//		}
//		
//		var p = $(this).data('p')
//			,t = $(this).data('t')
//			,$this = $(this);
//			
//			$this.parent().find('img').show();
//			
//			$.post(LLG.url() + 'nodeCommands.php',{'t':t,'p':p},function(r){
//				$this.parent().parent().find('textarea').val(r);
//				$this.parent().find('img').hide();
//			});
//        }
//    );
//	
//	//search feature
//	defaultSrchTxt = $('#searchgrid').val();
//	$('#searchgrid').tooltip({ position: {my: "left bottom",at: "left top"}});
//	$('#searchgrid').off('focus').on('focus',function(event){
//		if($(this).val() == defaultSrchTxt){
//			$(this).val('');
//			$(this).css('color','#333333');
//		}
//	});
//	$('#searchgrid').off('blur').on('blur',function(event){
//		if($(this).val() == ''){
//			$(this).val(defaultSrchTxt);
//			$(this).css('color','#777777');
//		}
//	});
//	
//	var searchTimer;
//	$('#searchgrid').off('keyup').on('keyup',function(event){
//		clearTimeout(searchTimer);
//		searchTimer = setTimeout(function(){watcherSearchFunction();},500);
//	});
//	
//	$('#searchgrid').off('keydown').on('keydown',function(){
//		clearTimeout(searchTimer);
//	});
//	
//	resizeLayout();
	
	$('#exportAllRows').off('click').on('click',function(){
		var data = LLG.cont.handsontable('getData',0,0,LLG.cont.handsontable('countRows'),getColIndex['Nodeid']),
		headers = LLG.cont.handsontable('getColHeader'),
		csv = '',
		wu = LLG.watcherUpdate;
		for(var i=0;i<=getColIndex['Nodeid'];i++){
			csv += '"' +  headers[i] + '",';
		}
		
		csv = csv.slice(0,-1) +'\n';
		
		$.each(data,function(i,v){
    		if(v[0] != null){
    			csv += '"' + v[0] + '",';
    			csv += '"' + wu[v[0]]['c'] + '",';
    			csv += '"' + wu[v[0]]['u'] + '",';
    			csv += '"' + wu[v[0]]['l'] + '",';
    			csv += '"' + wu[v[0]]['a'] + '",';
    			csv += '"' + wu[v[0]]['d'] + '",';
    			csv += '"' + wu[v[0]]['i'] + '",';
    			csv += '"' + wu[v[0]]['t'] + '"\n';
    			}
    		});
		
		var a         = document.createElement('a');
		a.href        = 'data:attachment/csv,' + encodeURIComponent(csv);
		a.target      = '_blank';
		a.download    = 'PatrollerExport.csv';
		
		document.body.appendChild(a);
		a.click();
	});
});

function trim1 (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

//change position of button
function resizeLayout(){
	var w = $('table.htCore').width(),y;
	if(w>300){
		if( w != null){
			y = w - 820;
			$('#checkAllStatus').css('margin-left',y + 'px');
			//$('.dragdealer.vertical').css({'left':w + 'px','width':'20px'});
			//$('.handsontable .dragdealer .handle').css('width','20' + 'px')
		}
	}else{
		setTimeout(function(){resizeLayout();},100);
	}
};

//create some lookup arrays for fast functionality
function adjustColHeaderData() {
    getColIndex = {};
	getColRealNameIndex = {};
    $.each(colHeaderData, function (i, v) {
        getColIndex[v] = i;
    });
	$.each(colHeaderDataActualNames, function (i, v) {
        getColRealNameIndex[v] = i;
    });
};

//Rerendering is used everywhere, let's make it a function!
function renderDT(){
	LLG.cont.handsontable('render');
};

function renderHwDT(){
	LLG.hwcont.handsontable('render');
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
			v[colIndex] = LLG.watcherUpdate[v[0]][colHeaderUpdate[colIndex]];
		}
	});
	
	LLG.cont.handsontable('getInstance').observer.object = LLG.cont.handsontable('getInstance').observedData;
};

function watcherSearchFunction(){
	var dt = LLG.cont
	,value = escapeRegExp($('#searchgrid').val())
	,searcharray = []
	,data = LLG.watcher,row,col,r_len,c_len,d,lbreak = false,tempTester = {}
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
		
		if(typeof(LLG.wSrch) != 'undefined'){
			searchWatcher = LLG.wSrch.slice(0);
		}else{
			searchWatcher = LLG.watcher.slice(0);
		}
		for(var j=0;j<=getColIndex['diagknowsysVersion'];j++){
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
		var returnArray = [];
		
		if(typeof(LLG.wSrch) != 'undefined'){
			searcharray = LLG.wSrch.slice(0);
		}else{
			searcharray = LLG.watcher.slice(0);
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
	}
	
	if(fastSearch){
		setTotalRows(searcharray);
		dt.handsontable('loadData',searcharray);
		resizeLayout();
	}else if(value.length){				
		
		if(typeof(LLG.wSrch) != 'undefined'){
			searchWatcher = LLG.wSrch.slice(0);
		}else{
			searchWatcher = LLG.watcher.slice(0);
		}
		
		$.each(value,function(i,v){
			queryRegex = new RegExp(v, 'i');
			searcharray.push.apply(searcharray,searchWatcher.filter(function(choice){
			  return queryRegex.test(choice);
			}));
		});				

		setTotalRows(searcharray);
		dt.handsontable('loadData',searcharray);
		resizeLayout();
	}
	else{
		setTotalRows(data);
		dt.handsontable('loadData', data);
		resizeLayout();
	}
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

function watchButGetHistory(row){
	var pl = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid'])
		,u = LLG.watcherUpdate[pl]['u']
		,c = LLG.watcherUpdate[pl]['c'];
		
		$('#sickBayDialog').html('<div style="text-align:center;padding-top:100px"><img src="images/blank_loading75.gif" /></div>');
		$('#sickBayDialog').load(LLG.url()+ 'engineInfo.php',{t: 'getSickBayHistory',p: pl});
		$('#sickBayDialog').dialog('option','title', 'History for ' + c + ' Vehicle: ' + u + ' (' + pl + ')' );
		$('#sickBayDialog').dialog('open');
};

function watchButNodeCommands(row){
		
		if( LLG.watcherUpdate[LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid'])]['t'] > 5 ){return;}
	
		if($('#watcherDialog').dialog('isOpen')){
			if($('#watcherDialog').find('img').is(":visible")){
				if(!confirm('A command is running. This will close the window and cancel the command.')){
					return false;
				}
			}
		}
		
		var p = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid'])
			,u = LLG.watcherUpdate[p]['u']
			,c = LLG.watcherUpdate[p]['c'];
			$('#watcherDialog').html('<div id="activatehelp" data-on="false">CLICK THIS LINK! you will notice this link in many places on Liban Labs (hover over buttons after clicking) ---------> turn on help tips</div>' + nodeCommandDivs('What is my drivetrain?','drivetrain', p,'ncddt') 
										+ nodeCommandDivs('What are my platform parameters?','platformParameters', p,'ncdpp')
										+ nodeCommandDivs('Force Software Upgrade (HOS safe)','upgradeDist', p,'ncdud')
										+ nodeCommandDivs('Disable Display','displayDisable', p,'ncddd')
										+ nodeCommandDivs('Enable Display','displayEnable', p,'ncded')
										+ nodeCommandDivs('AFS Uninstall','afsDisable', p,'ncdad')
										+ nodeCommandDivs('AFS Install','afsEnable', p,'ncdae'));
			$('#watcherDialog').dialog( 'option','title', 'Commands for ' + c + ' Vehicle: ' + u + ' (' + p + ')' );
			$('#watcherDialog').dialog('open');	
};

function watchButMarkInactive(row){
			var platform = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid']);
			
			if(confirm('This will remove this truck from the SickBay Tool. Usually only use this if the truck is inactive.')){
				LLG.cont.handsontable('alter','remove_row',row);
				$.post(LLG.url()+ 'engineInfo.php', {t: 'markInactive',p: platform});
			}
};

function watchButConnectToNode(row){
	var p = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid'])
		,ip = LLG.watcherUpdate[p]['i'];
		
		if( LLG.watcherUpdate[p]['t'] > 6 ){
			if( confirm('This node is off, but you can try to connect if you\'d like smarty.') ){
				window.open('ssh://liban@' + ip + ':222');
			}
		}else{
			window.open('ssh://liban@' + ip + ':222');
		}
};

function watchButNodeStatus(row){
			var platform = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid']);
			
			if( LLG.watcherUpdate[platform]['t'] > 5 ){return;}
			
			var loading = '<div style="text-align:center"><img class="loadNodeStatus" src="images/blank_loading20.gif" /></div>';
			
			//if( LLG.cont.handsontable('getDataAtCell',row, getColIndex['Status']) == loading ){return;}
						
			LLG.nodestatus[platform] = {'pending':true
									,'gps':''
									,'j1939':''
									,'j1708':''
									,'display':''
									,'serial':''};
									
			LLG.cont.handsontable('setDataAtCell', row, getColIndex['Status'],loading);
			
			/*$.post(LLG.url()+ 'engineInfo.php', {t: 'getNodeStatus',p: platform}, function (data, status) {
				var obj = JSON.parse(data);
				LLG.nodestatus[obj['platformid']] 	= {'pending':false
													,'gps':obj['gps']
													,'j1939':obj['j1939']
													,'j1708':obj['j1708']
													,'display':obj['display']
													,'serial':obj['serial']};
				//super slow for user if we don't spread the renderings out.
				if(LLG.genericTimer.nodestatus == false || $.active < 3){
					LLG.genericTimer.nodestatus = true;
					setTimeout(function(){renderDT();LLG.genericTimer.nodestatus = false;},2000);
				}
			});*/
};

function toUpperAllowNull(obj){
	if(obj != null ){
		obj = obj.toUpperCase();
	}else{
		obj = '';
	}
	return obj;
};