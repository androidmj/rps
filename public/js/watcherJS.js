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
/*		,
		beforeClose: function(){
			if($('#sickBayDialog').find('img').is(":visible")){
				if(!confirm('A command is running. This will close the window and cancel the command.')){
					return false;
				}
			}
			return true;
		}*/
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
	
	LLG.genericTimer = {};
	
	/*
	Custom Renderers
	*/
    LLG.sshConnectRenderer = function (instance,td, row, col, prop, value, cellProperties) {
		var but = '<div style="text-align:center"><div class="connectToNode blueBut" data-row="' 
						+ row 
						+ '" style="font-size:14px;padding:1px 2px" title="connect">☎</div></div>';
		
        td.innerHTML = but;
        return td;
    };
	
	LLG.getHistoryRenderer = function (instance,td, row) {
				
		td.innerHTML = '<div style="text-align:center"><div class="getHistory blueBut" data-row="' 
				+ row
				+ '" title="check history">&nbsp;H&nbsp;</div></div>';
				
        return td;
    };
	
	LLG.nodeCommandsRenderer = function (instance,td, row, col, prop, value, cellProperties) {
		var p = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid']),
		minago = ( LLG.watcherUpdate.hasOwnProperty(p) && LLG.watcherUpdate[p]['t'] < 6 );
		
		$(td).parent().toggleClass( 'onRow', minago );
			
		if( true ){
        	td.innerHTML = '<div style="text-align:center"><div class="nodeCommands blueBut" data-platformid="' 
						+ p 
						+ '" title="run commands">&nbsp;C&nbsp;</div></div>';
		}else{
			td.innerHTML = 'off';
		}
        
        return td;
    };
	
    LLG.nodeCheckRenderer = function (instance,td, row, col, prop, value, cellProperties) {
		var p = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid'])
		,but = 'off'
		,pending = (typeof(LLG.nodestatus) != 'undefined' && LLG.nodestatus.hasOwnProperty(p) && LLG.nodestatus[p]['pending']) == true ? true : false
		,loading = '<div style="text-align:center"><img class="loadNodeStatus" src="images/blank_loading20.gif" /></div>';

		if(pending){
			but = loading;
			td.innerHTML = but;
        	return td;
		}	

		if( LLG.watcherUpdate.hasOwnProperty(p) && LLG.watcherUpdate[p]['t'] < 6 && LLG.watcherUpdate[p]['a'] == 'RUNNING'){
        	but = '<div style="text-align:center"><div class="nodeStatus blueBut" data-row="' 
					+ row
					+ '" title="get status">&nbsp;?&nbsp;</div><img class="loadNodeStatus" data-row="' 
					+ row 
					+ '" src="images/blank_loading20.gif" style="display:none" /></div>';
		}
		
        td.innerHTML = but;
        return td;
    };
	
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
	
	LLG.ahmUpdater = function (instance,td, row, col, prop, value, cellProperties) {
		var e
		,p = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid']);
		
		if( LLG.watcherUpdate.hasOwnProperty(p) ){
			e = LLG.watcherUpdate[p][colHeaderUpdate[col]];
		}else{
			td.innerHTML = '';
			return td;
		}
		
        td.innerHTML = e;
		switch(e){
			case 'RUNNING':
				$(td).addClass('blue');
				break;
				
			case 'SLEEPING':
				$(td).addClass('purple');
				break;	
				
			case 'STOPPED':
				$(td).addClass('red');
				break;
				
			case 'STARTING':
				$(td).addClass('green');
				break;
		}
			
        return td;
    };
	
	LLG.nodeStatusUpdater = function (instance,td, row, col) {
		var e
		,p = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid']);
		
		if( LLG.nodestatus.hasOwnProperty(p) ){
			e = LLG.nodestatus[p][colHeaderUpdate[col]];
		}else{
			td.innerHTML = '';
			return td;
		}
		
        td.innerHTML = e;
		
		if(e != 'Pass'){
			$(td).addClass('red');
		}
			
        return td;
    };
	
	LLG.vnaUpdater = function (instance,td, row, col, prop, value, cellProperties) {
		var e
		,p = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid']);
		
		if(LLG.vna.hasOwnProperty(p) ){
			e = LLG.vna[p][colHeaderUpdate[col]];
		}else{
			td.innerHTML = '';
			return td;
		}
		
        td.innerHTML = e;
		if(e != 'success'){
			$(td).addClass('red');
		}
			
        return td;
    };
	
	LLG.vnaRenderer = function (instance,td, row, col, prop, value, cellProperties) {
        var p = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid'])
		,but='off'
		,pending = (typeof(LLG.vna) != 'undefined' && LLG.vna.hasOwnProperty(p) && LLG.vna[p]['pending']) == true ? true : false
		,loading = '<div style="text-align:center"><img class="loadflashVNA" src="images/blank_loading20.gif" /></div>';
		
		if (value != null && value.length > 40 && value.length < 50) {
            return;
        }
		
		if( LLG.watcherUpdate.hasOwnProperty(p) && (LLG.watcherUpdate[p]['t'] > 6 || (LLG.watcherUpdate[p]['a'] != 'RUNNING' && LLG.watcherUpdate[p]['a'] != 'STOPPED') )){
			if(pending){
				but = loading;
			}else{
				td.style.textAlign = 'center';
			}
		}else if( pending ){
			//the vna button has been hit, so keep the loading vna gif.  Need to do it this way because
			//table has a set height, so row 1 has different information as you scroll
			but = loading;
		}else {
        	but = '<div style="text-align:center"><div class="flashVNA blueBut" data-platformid="' 
					+ p 
					+ '" style="font-size:14px;padding:1px 2px" title="flash vna">Flash</div><img class="loadflashVNA" data-platformid="' 
					+ p 
					+ '" src="images/blank_loading20.gif" style="display:none" /></div>';
		}
        td.innerHTML = but;
        return td;
    };
	
    /*
	Some global variables
	*/
	colHeaderUpdate = ['p','c', 'u', 'l', 'a', 'd', 'i','t','Connect','gps','j1939','j1708','display','serial','vna'];
    colHeaderData = ['Platformid','Customer', 'Usertag','Last Heard', 'ahmState', 'diagknowsysVersion', 'IP Address','Time','Connect','GPS','j1939','j1708','display','serial','vna','Status','Commands','History','VNA'];
    colHeaderDataActualNames = ['Platformid','Customer', 'Usertag','Last Heard', 'ahmState', 'Cur / Set', 'IP Address','minutes','☎','GPS','j1939','j1708','display','serial','vna','?','C','hist','VNA'];

	/*
	create variable called getColIndex.  Allows lookup by key.  ex getColIndex['Platformid'] equals 0
	*/
    adjustColHeaderData();

	//setup excel like table and render it
	$("#dataTable").handsontable({
			colHeaders: function (col) {
				switch (col) {
					case getColIndex['Time']:
						return '<span title="Minutes since last heard">' + colHeaderDataActualNames[col] + '</span>';
					
					case getColIndex['GPS']:
						return '<span title="Potential Antenna Issue if FAIL">' + colHeaderDataActualNames[col] + '</span>';
					
					case getColIndex['display']:
						return '<span title="Possibilities: Pass, Unplugged, or Nexcom">' + colHeaderDataActualNames[col] + '</span>';
						
					case getColIndex['serial']:
						return '<span title="Possibilities: Bendix, Pass *means nothing is plugged in here*, Fail *something is plugged in, but it is not Bendix and the J-busses failed, so is the vna plugged into the wrong port?*">' + colHeaderDataActualNames[col] + '</span>';
						
					case getColIndex['vna']:
						return '<span title="Response from clicking Flash vna button">' + colHeaderDataActualNames[col] + '</span>';
					
					default:
						return colHeaderDataActualNames[col];
				}
			},
			startCols: Object.keys(getColIndex).length,
			autoWrapRow: true,
			contextMenu: {
                callback: function (key,opt){
                    if(key === 'edvir'){
                        setTimeout(function () {
                            var platformId = LLG.cont.handsontable('getDataAtCell',opt.start.row(), getColIndex['Platformid']);
                            var ip = LLG.watcherUpdate[platformId]['i'];
                            //timeout is used to make sure the menu collapsed before alert is shown
                            $.post( 'nodeCommands.php', {t:'DisableFirewall',p:platformId}, function() {
                                window.open('http://' + ip + ':8080/vir', 'eDvir')
                            });
                        }, 100);
                    }
                },
                items:{
                    "edvir": {
                        name: 'Open eDvir'
                        ,disabled: function () {
                            return (LLG.watcherUpdate[LLG.cont.handsontable('getDataAtCell',LLG.cont.handsontable('getSelected')[0], getColIndex['Platformid'])]['t'] > 5)
                        }
                    }
                }
            },
			height:600,
			width: 1180,
			columnSorting:true,
			manualColumnResize: true,
			columns: [ {
				type: 'numeric',
				readOnly:true,
				width:'70px'
			}, {
				type: 'text',
				readOnly:true,
				width:'90px'
			}, {//usertag
				renderer:LLG.watcherUpdater,
				readOnly:true,
				width:'100px'
			},{//last heard
				renderer:LLG.watcherUpdater,
				readOnly:true
			},{//ahmstate
				renderer:LLG.ahmUpdater,
				readOnly:true
			},{
				//cur set
				renderer:LLG.watcherUpdater,
				readOnly:true,
				width:'80px'
			},{//ip
				renderer:LLG.watcherUpdater,
				readOnly:true,
				width:'98px'
			},{//min
				renderer:LLG.watcherUpdater,
				readOnly:true
			},{
				renderer: LLG.sshConnectRenderer,
				readOnly: true,
				width:'27px'
			},{
				renderer:LLG.nodeStatusUpdater,
				readOnly:true,
				width:'50px'
			},{
				renderer:LLG.nodeStatusUpdater,
				readOnly:true,
				width:'50px'
			},{
				renderer:LLG.nodeStatusUpdater,
				readOnly:true,
				width:'50px'
			},{
				renderer:LLG.nodeStatusUpdater,
				readOnly:true,
				width:'50px'
			},{
				renderer:LLG.nodeStatusUpdater,
				readOnly:true,
				width:'50px'
			},{
				renderer:LLG.vnaUpdater,
				readOnly:true,
				width:'52px'
			},{
				renderer: LLG.nodeCheckRenderer,
				readOnly:true,
				width:'28px'
			},{
				renderer: LLG.nodeCommandsRenderer,
				readOnly:true,
				width:'29px'
			},{
				renderer: LLG.getHistoryRenderer,
				readOnly:true,
				width:'29px'
			}, {
                renderer: LLG.vnaRenderer,
            	readOnly: true,
				width:'65px'
        	}],
			afterSelection: function (r,c,r2,c2) {
				if(c == c2){
					switch(c){
						case getColIndex['History']:
						watchButGetHistory(r);
						break;
						
						case getColIndex['Commands']:
						watchButNodeCommands(r);
						break;
						
						case getColIndex['Connect']:
						watchButConnectToNode(r);
						break;
						
						default:
						break;
					}
				}
			}
		});
	
    //Load orininal table data
    $.post(LLG.url()+ 'engineInfo.php', {
        t: 'getWatcher'
    }, function (data, status) {
        //Original watcher data, will not change and contains platformid,customer,and usertag information
		//all other info is found in the updateWatcher object and is queried as the user scrolls the table
        LLG.watcher = JSON.parse(data);
		setTotalRows(LLG.watcher);
		
		/*LLG.fastSrchArray = {'platformid':{},'customer':{},'usertag':{}};
		$.each(LLG.watcher,function(i,v){
			LLG.fastSrchArray.platformid[v[0]]=i;
			if(typeof(LLG.fastSrchArray.customer[v[1]]) == 'undefined'){
			 LLG.fastSrchArray.customer[v[1]] = [];
			}
			LLG.fastSrchArray.customer[v[1]].push(i);
			if(typeof(LLG.fastSrchArray.usertag[v[2]]) == 'undefined'){
			 LLG.fastSrchArray.usertag[v[2]] = [];
			}
			LLG.fastSrchArray.usertag[v[2]].push(i);
		});*/
		
		if(typeof LLG.watcherUpdate != 'object'){
			return;
		}else{
			$('#watcherloading').hide();
			$('#hiddenMainDiv').show();
			renderDT();
        	LLG.cont.handsontable('loadData',LLG.watcher);
			marioLoadStop();
		}
    });
	
	$.post(LLG.url()+ 'engineInfo.php', {
		t: 'updateWatcher'
	}, function (data, status) {
		//Holds all dynamic information found in the watcher table, EXCEPT the node status check info
		LLG.watcherUpdate = JSON.parse(data);
		
		if(typeof LLG.watcher != 'object'){
			return;
		}else{
			$('#watcherloading').hide();
        	$('#hiddenMainDiv').show();
			renderDT();
        	LLG.cont.handsontable('loadData',LLG.watcher);
			marioLoadStop();
		}
	});
	
	//Watcher gets updated every minute
	intervalTimers['updateWatcher'] = null;
	clearInterval(intervalTimers['updateWatcher']);
	
	intervalTimers['updateWatcher'] = setInterval(function() {
		$.post(LLG.url()+ 'engineInfo.php', {
        	t: 'updateWatcher'
		}, function (data, status) {
			//array that will hold all the engine info for quick validation of cells
			LLG.watcherUpdate = JSON.parse(data);
			renderDT();
			var obj = LLG.cont.handsontable('getInstance');
			
			//are we sorted...yes? update sort info and sort.
			//I'm leaving setTimeout in here to make it asynchronous, but can probably be removed
			if(typeof obj.sortColumn != 'undefined'){
				var col = obj.sortColumn, order = obj.sortOrder;
				if(col > getColIndex['Platformid'] && col < getColIndex['Connect']){
					if($('#searchgrid').val() != '' && $('#searchgrid').val() != defaultSrchTxt){
						watcherSearchFunction();
					}

					col = columnSortingFunction(col);
					LLG.cont.handsontable('getInstance').sort(col,order);
				}
			}else{
				if($('#searchgrid').val() != '' && $('#searchgrid').val() != defaultSrchTxt){
					watcherSearchFunction();
				}
			}
		});
	},60000);
	
	intervalTimers['getWatcher'] = null;
	clearInterval(intervalTimers['getWatcher']);
	
	intervalTimers['getWatcher'] = setInterval(function() {
		$.post(LLG.url()+ 'engineInfo.php', {
        	t: 'getWatcher'
		}, function (data, status) {
			LLG.wSrch = JSON.parse(data);
			//force a serch to occur
		});
	},60000);
	
	LLG.sortorder = false;
	//replace default columnSorting behavior to update dynamic rows in the sort array
	$(document).off('click','.columnSorting').on('click','.columnSorting', function(){
		var col = $(this).html();
		
		if(col.indexOf('span') > -1){
			col = getColRealNameIndex[col.substring(col.indexOf('>')+1,col.lastIndexOf('<'))];
		}else{
			col = getColRealNameIndex[col];
		}
		
		if( col > getColIndex['Platformid'] && col < getColIndex['Connect'] ){
			col = columnSortingFunction(col);
		}
		LLG.cont.handsontable('getInstance').sort(col,LLG.sortorder);
		LLG.sortorder = LLG.sortorder ? false : true;
	});

	//Check all visible statuses at once
	$(document).off('click','#checkAllStatus').on('click','#checkAllStatus', function(){
		$('.nodeStatus').click();
	});

	//Let's check the  OBC status
	LLG.nodestatus = Array();
	LLG.genericTimer.nodestatus = false;
	$(document).off('click','.nodeStatus').on('click','.nodeStatus', function () {
			var platform = LLG.cont.handsontable('getDataAtCell',$(this).data('row'), getColIndex['Platformid'])
			
			var th = $(this),
                loadgif = $('.loadNodeStatus[data-row="' + th.data('row') + '"]');
                th.hide();
                loadgif.show();
			
			LLG.nodestatus[platform] = {'pending':true
									,'gps':''
									,'j1939':''
									,'j1708':''
									,'display':''
									,'serial':''};
			
			$.post(LLG.url()+ 'engineInfo.php', {t: 'getNodeStatus',p: platform}, function (data, status) {
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
			});
        }
    );
	
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
	
	LLG.vna = Array();
	LLG.genericTimer.vna = false;
	$(document).off('click','.flashVNA').on('click','.flashVNA', function () {
		var platform = $(this).data('platformid');
		
		var th = $(this),
			loadgif = $('.loadflashVNA[data-platformid="' + platform + '"]');
			th.hide();
			loadgif.show();
		
		LLG.vna[platform] = {'pending':true
								,'vna':''};
		
		$.post(LLG.url()+ 'engineInfo.php', {t: 'watcherVNAflash',p: platform}, function (data, status) {
			var obj = JSON.parse(data);
			LLG.vna[obj['platformid']] 	= {'pending':false
												,'vna':obj['vna']};
			//super slow for user if we don't spread the renderings out.
			if(LLG.genericTimer.vna == false || $.active < 3){
				LLG.genericTimer.vna = true;
				setTimeout(function(){renderDT();LLG.genericTimer.vna = false;},2000);
			}
		});
	});
	
	$(document).off('click','.dialogbutton').on('click','.dialogbutton', function () {

		if( $(this).parent().find('img').css('display') != 'none'){
			return;
		}
		
		var p = $(this).data('p')
			,t = $(this).data('t')
			,$this = $(this)
			,v = $this.parent().parent().find('textarea').val().substring(0, 10);
			
			$this.parent().find('img').show();
			
			$.post('nodeCommands.php',{'t':t,'p':p,'v':v},function(r){
				$this.parent().parent().find('textarea').val(r);
				$this.parent().find('img').hide();
			});
        }
    );
	
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
	$('#searchgrid').off('keyup paste cut').on('keyup paste cut',function(event){
		clearTimeout(searchTimer);
		searchTimer = setTimeout(function(){watcherSearchFunction();},500);
	});
	
	$('#searchgrid').off('keydown').on('keydown',function(){
		clearTimeout(searchTimer);
	});
	
	resizeLayout();
	
	$('#exportAllRows').off('click').on('click',function(){
		var data = LLG.cont.handsontable('getData',0,0,LLG.cont.handsontable('countRows'),getColIndex['Time']),
		headers = LLG.cont.handsontable('getColHeader'),
		csv = '',
		wu = LLG.watcherUpdate;
		for(var i=0;i<=getColIndex['Time'];i++){
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
	
	$.post(LLG.url()+ 'nodeCommands.php', {
        m: '1'
    }, function (data, status) {
        //Original watcher data, will not change and contains platformid,customer,and usertag information
		//all other info is found in the updateWatcher object and is queried as the user scrolls the table
        LLG.nodeCommands = JSON.parse(data);
		LLG.nodeCommandsString = '';
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

//Sorting with handsontable requires a lot of overhead. This removes that.
//I edited handsontable js and added a global variable called RUNafterChangesObserved
//You will get bugs if you update handsontable without including this variable
//in the source code!!! ask MDJ
function columnSortingFunction(colIndex){
	if(colIndex == getColIndex['Last Heard']){
		colIndex = getColIndex['Time'];
	}
	LLG.cont.handsontable('getInstance').observeChangesActive = false;
	RUNafterChangesObserved = false;
	
	$.each(LLG.cont.handsontable('getInstance').observedData,function(i,v){
		if(v[0]!=null){
			if( LLG.watcherUpdate.hasOwnProperty(v[0]) ){
				v[colIndex] = LLG.watcherUpdate[v[0]][colHeaderUpdate[colIndex]];
			}
		}
	});
	
	LLG.cont.handsontable('getInstance').observer.object = LLG.cont.handsontable('getInstance').observedData;
	
	return colIndex;
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
		value = removeDuplicates(value);
		
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
		value = removeDuplicates(value);
		
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
		
		value = removeDuplicates(value);
	}
	
	if(fastSearch){
		searcharray = removeDupSrchArr(searcharray);
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
		
		searcharray = removeDupSrchArr(searcharray);

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
		
		if( LLG.watcherUpdate[LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid'])]['t'] > 5 ){
			if(!confirm('This node is off, but you can try to connect if you\'d like smarty.'))
			{
				return;
				}
		}
	
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
			
			LLG.nodeCommandsString = '';
			
			$.each(LLG.nodeCommands,function(i,value){
				LLG.nodeCommandsString += nodeCommandDivs(value.split(/(?=[A-Z6])/).join(' '),value, p,'ncd'+value);
			})
			
			$('#watcherDialog').html('<div id="activatehelp" data-on="false">CLICK THIS LINK! you will notice this link in many places on Liban Labs (hover over buttons after clicking) ---------> turn on help tips</div>' + LLG.nodeCommandsString);
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