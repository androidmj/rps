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
	
	LLG.genericTimer = {};
	
	/*
	Custom Renderers
	*/
	
	LLG.getHistoryRenderer = function (instance,td, row) {
				
		td.innerHTML = '<div style="text-align:center"><div class="genBut blueBut" title="check history">&nbsp;H&nbsp;</div></div>';
				
        return td;
    };
	
	LLG.nodeCommandsRenderer = function (instance,td, row, col, prop, value, cellProperties) {
		var p = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid']),
		minago = ( LLG.watcherUpdate.hasOwnProperty(p) && LLG.watcherUpdate[p]['m'] < 6 );
		
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
	
	LLG.markInactive = function (instance,td, row) {
		var p = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid']);
		
		$(td).parent().toggleClass( 'onRow', ( LLG.watcherUpdate.hasOwnProperty(p) && LLG.watcherUpdate[p]['m'] < 6 ) );
						
        td.innerHTML = '<div style="text-align:center"><div class="genBut blueBut" data-row="'+row+'" title="mark inactive">&nbsp;X&nbsp;</div></div>';
        return td;
    };
	
	LLG.watcherUpdater = function (instance,td, row, col) {
		var e
		,p = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid']);

	/*	if(col < getColIndex['GPS']){
			obj = LLG.watcherUpdate;
		}else if(col == getColIndex['vna']){
			obj = LLG.vna;
			vna = true;
		}else{
			obj = LLG.nodestatus;
			node = true;
		}*/
		
		if( LLG.watcherUpdate.hasOwnProperty(p) ){
			e = Handsontable.helper.stringify(LLG.watcherUpdate[p][colHeaderUpdate[col]]);
		}else{
			td.innerHTML = '';
			return td;
		}
		
	    td.innerHTML = e;        
		return td;
    };
	
	LLG.passFailUpdater = function (instance,td, row, col) {
		var e
		,p = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid']);
		
		if( LLG.watcherUpdate.hasOwnProperty(p) ){
			e = Handsontable.helper.stringify(LLG.watcherUpdate[p][colHeaderUpdate[col]]);
		}else{
			td.innerHTML = '';
			return td;
		}
		
	    td.innerHTML = e;
	   
		if(e == 'Fail' || e == 'Unplugged' || e == 'Bad'){
			$(td).addClass('red');
		}
        
		return td;
    };
	
    /*
	Some global variables
	*/
	colHeaderUpdate = ['p','c', 'u','t', 'l', 'm','v', 'g', 'd','s','w','n'];
    colHeaderData = ['Platformid','Customer', 'Usertag','Groups','Last Heard','Min','diagknowsysVersion', 'GPS','Databus','Screen','MAC','Notes','Commands','Hist','markInactive'];
    colHeaderDataActualNames = ['Platformid','Customer', 'Usertag','Groups','Last Heard','Min','Cur / Set', 'GPS','J-bus','Screen','MAC','Notes','C','Hist','X'];

	/*
	create variable called getColIndex.  Allows lookup by key.  ex getColIndex['Platformid'] equals 0
	*/
    adjustColHeaderData();
	
	//setup excel like table and render it
	$("#dataTable").handsontable({
			colHeaders: function (col) {
				switch (col) {
					case getColIndex['Min']:
						return '<span title="Minutes since last heard">' + colHeaderDataActualNames[col] + '</span>';
					
					case getColIndex['Databus']:
						return '<span title="Both J-busses failed">' + colHeaderDataActualNames[col] + '</span>';
					
					case getColIndex['Screen']:
						return '<span title="Unplugged Display?">' + colHeaderDataActualNames[col] + '</span>';
						
					case getColIndex['MAC']:
						return '<span title="Reported MAC does not match node assignment.">' + colHeaderDataActualNames[col] + '</span>';
					
					default:
						return colHeaderDataActualNames[col];
				}
			},
			startCols: Object.keys(getColIndex).length,
			autoWrapRow: true,
			contextMenu: true,
			height:500,
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
			}, {//groups
				renderer:LLG.watcherUpdater,
				readOnly:true,
				width:'50px'
			},{//last heard
				renderer:LLG.watcherUpdater,
				readOnly:true,
				width:'110px'
			},{//minago
				renderer:LLG.watcherUpdater,
				readOnly:true
			},{
				//cur set
				renderer:LLG.watcherUpdater,
				readOnly:true,
				width:'80px'
			},{//gps
				renderer:LLG.passFailUpdater,
				readOnly:true
			},{//databus
				renderer:LLG.passFailUpdater,
				readOnly:true
			},{//screen
				renderer:LLG.passFailUpdater,
				readOnly:true
			},{//MAC
				renderer:LLG.passFailUpdater,
				readOnly:true
			},{//notes
				renderer:LLG.watcherUpdater,
				width:'260px'
			},{//databus
				renderer: LLG.nodeCommandsRenderer,
				readOnly:true,
				width:'32px'
			},{//databus
				renderer: LLG.getHistoryRenderer,
				readOnly:true,
				width:'32px'
			},{//databus
				renderer: LLG.markInactive,
				readOnly:true,
				width:'32px'
			}
			],
			beforeChange: function (changes, source) {
				if (source !== 'loadData') {
					if(changes[0][1] == getColIndex['Notes']){
						var platform = LLG.cont.handsontable('getDataAtCell',changes[0][0], getColIndex['Platformid'])
						,obj = LLG.watcherUpdate;
						
						if( platform != null && platform != '' && obj.hasOwnProperty(platform) ){
							obj[platform]['n'] = changes[0][3];
							$.post(LLG.url()+ 'engineInfo.php', {t: 'updateSickBayNotes', p: platform, n:changes[0][3]});
						}
					}
				}
			},
			afterSelection: function (r,c,r2,c2) {
				if(c == c2){
					switch(c){
						case getColIndex['Hist']:
						sickButGetHistory(r);
						break;
						
						case getColIndex['Commands']:
						sickButNodeCommands(r);
						break;
						
						case getColIndex['markInactive']:
						sickButMarkInactive(r);
						break;
						
						default:
						break;
					}
				}
			}
		});
	
    //Load orininal table data
    $.post(LLG.url()+ 'engineInfo.php', {
        t: 'getSickBay'
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
		t: 'updateSickBay'
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
	intervalTimers['updateSickBay'] = null;
	clearInterval(intervalTimers['updateSickBay']);
	
	intervalTimers['updateSickBay'] = setInterval(function() {
		$.post(LLG.url()+ 'engineInfo.php', {
        	t: 'updateSickBay'
		}, function (data, status) {
			//array that will hold all the engine info for quick validation of cells
			LLG.watcherUpdate = JSON.parse(data);
			renderDT();
			var obj = LLG.cont.handsontable('getInstance');
			
			//are we sorted...yes? update sort info and sort.
			//I'm leaving setTimeout in here to make it asynchronous, but can probably be removed
			if(typeof obj.sortColumn != 'undefined'){
				var col = obj.sortColumn, order = obj.sortOrder;
				if(col > getColIndex['Platformid'] && col <= getColIndex['Databus']){
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
	
	intervalTimers['getSickBay'] = null;
	clearInterval(intervalTimers['getSickBay']);
	
	intervalTimers['getSickBay'] = setInterval(function() {
		$.post(LLG.url()+ 'engineInfo.php', {
        	t: 'getSickBay'
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
		
		if( col > getColIndex['Platformid'] && col <= getColIndex['Databus'] ){
			col = columnSortingFunction(col);
		}
		
		//LLG.cont.handsontable('getInstance').sortOrder = LLG.sortorder;
		LLG.cont.handsontable('getInstance').sort(col,LLG.sortorder);
		LLG.sortorder = LLG.sortorder ? false : true;
	});

	//Check all visible statuses at once
	$(document).off('click','#checkAllStatus').on('click','#checkAllStatus', function(){
		$('.nodeStatus').click();
	});
	
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
	
	
	$('#exportAllRows').off('click').on('click',function(){
		var data = LLG.cont.handsontable('getData',0,0,LLG.cont.handsontable('countRows'),getColIndex['Databus']),
		headers = LLG.cont.handsontable('getColHeader'),
		csv = '';
		
		for(var i=0;i<=getColIndex['Databus'];i++){
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
		colIndex = getColIndex['Min'];
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

function sickButGetHistory(row){
	var pl = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid'])
		,u = LLG.watcherUpdate[pl]['u']
		,c = LLG.watcherUpdate[pl]['c'];
		
		$('#sickBayDialog').html('<div style="text-align:center;padding-top:100px"><img src="images/blank_loading75.gif" /></div>');
		$('#sickBayDialog').load(LLG.url()+ 'engineInfo.php',{t: 'getSickBayHistory',p: pl});
		$('#sickBayDialog').dialog('option','title', 'History for ' + c + ' Vehicle: ' + u + ' (' + pl + ')' );
		$('#sickBayDialog').dialog('open');
};

function sickButNodeCommands(row){
		
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

function sickButMarkInactive(row){
			var platform = LLG.cont.handsontable('getDataAtCell',row, getColIndex['Platformid']);
			
			if(confirm('This will remove this truck from the SickBay Tool. Usually only use this if the truck is inactive.')){
				LLG.cont.handsontable('alter','remove_row',row);
				$.post(LLG.url()+ 'engineInfo.php', {t: 'markInactive',p: platform});
			}
};