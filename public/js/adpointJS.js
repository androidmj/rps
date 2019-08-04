// Global object
var APG = {
  positionArray: []
};

// Constants
APG.VIDEO_COLUMNS = 100;
APG.VIDEO_ROWS = 50;
APG.ANIMATION_INTERVAL_MS = 42;
APG.MAX_TIME_DIFFERENCE = 0.25;

// Initialize global object variables
APG.positionArray[0] = 0;
APG.demoRow = null;
APG.demoColumn = null;
APG.demoBoxTimeout = null;
APG.savePositionTimeoutId = null;
APG.videoTimestamp = null;
APG.divPos = {};

$(document).ready(function(){
  // HTML objects
  APG.$videoSource = $("#video-source");
  APG.$videoWrapper = $("#video-wrapper");
  APG.$demoBox = $(".demo-box");

  // This allows us access to Current Video Time, as well as Video Controls
  APG.video = document.getElementById('video-source');



  // Set dynamic constants for help in functions that fire often
  setDynamicConstants();

  $(window).on('resize', function(){
    setDynamicConstants();
  });

  // Set the size of the grid box, which is defined by the video size and the number of rows and columns we want
  APG.$demoBox.css({
    'height': APG.rowHelper + 'px',
    'width': APG.columnHelper + 'px'
  });

  APG.$videoWrapper.mousemove(function(e){
    APG.divPos = {
        left: e.pageX - APG.videoOffsetLeft,
        top: e.pageY - APG.videoOffsetTop
    };
  });

  APG.$videoWrapper.on('mouseenter', function(e) {
    startAnimation();
    //
  }).on('mouseleave', function(e) {
    stopAnimation();
    //
  });

  // APG.$videoSource.on('timeupdate', function(e){
  //   APG.videoTimestamp = this.currentTime;
  // });

  setInterval(function () {
    // will get you a lot more updates than standard inaccurate 'timeupdate'
    APG.videoTimestamp = APG.video.currentTime;
  }, 42);

  APG.$videoWrapper.on('mousedown', function(e) {
    if( e.button == 2 ) {
      setRowAndColumn();
      showDemoBox(e);
      console.log(APG.divPos);
      console.log('column ' + APG.demoColumn);
      console.log('row ' + APG.demoRow);
      return false;
    }
    APG.savePositionTimeoutId = setInterval(function(){
      savePosition();
    }, 10);
  }).on('mouseup mouseleave', function() {
    clearInterval(APG.savePositionTimeoutId);
  });

  APG.$videoWrapper.on('contextmenu', function(){
    return false;
  });

  $("#button").on("click", hideAndShow);

  console.log(APG.videoOffsetTop);

  // Sometimes the offset is not correct on load. This is a hack.
  setTimeout(function(){
    $(window).trigger('resize');
    console.log(APG.videoOffsetTop);
  }, 1000);

});

function setRowAndColumn() {
  APG.demoColumn = Math.ceil(APG.divPos.left / APG.columnHelper);
  APG.demoColumn = limitBetweenMinMax(APG.demoColumn, 1, APG.VIDEO_COLUMNS);

  APG.demoRow = Math.ceil(APG.divPos.top / APG.rowHelper);
  APG.demoRow = limitBetweenMinMax(APG.demoRow, 1, APG.VIDEO_ROWS);
}

function limitBetweenMinMax(value, min, max){
  return Math.min(Math.max(parseInt(value), min), max);
}

function showDemoBox(){
  clearTimeout(APG.demoBoxTimeout);

  APG.$demoBox.css({
    'top': APG.videoOffsetTop + (APG.demoRow - 1) * APG.rowHelper + 'px',
    'left': APG.videoOffsetLeft + (APG.demoColumn - 1) * APG.columnHelper + 'px'
  });

  APG.demoBoxTimeout = setTimeout(function(){
    APG.$demoBox.css({
      'top': '-100px'
    });
  }, 500)
}

//save position data for the box that follows the eye
function savePosition(){
  //console.log('saved');
  setRowAndColumn();
  showDemoBox();
  APG.positionArray[Math.round(APG.ANIMATION_INTERVAL_MS * APG.videoTimestamp)] = {
    'column': APG.demoColumn,
    'row': APG.demoRow,
    'time': APG.videoTimestamp
  };

  console.log(APG.positionArray[Math.round(APG.ANIMATION_INTERVAL_MS * APG.videoTimestamp)].time);
}

function changePosition(){
  //find closest position in our array and use this
  var index = getClosestKey(Object.keys(APG.positionArray), Math.round(APG.ANIMATION_INTERVAL_MS * APG.videoTimestamp));

  APG.demoColumn = APG.positionArray[index].column;
  APG.demoRow = APG.positionArray[index].row;

  if(Math.abs(APG.positionArray[index].time - APG.videoTimestamp) < APG.MAX_TIME_DIFFERENCE){
    showDemoBox();
  }
}

// binary search
function getClosestKey(arr, val){
  var mid;
  var hi = arr.length - 1;
  var lo = 0;
  var currentVal;

  while (lo <= hi) {
    mid = (lo + hi) / 2 | 0;
    currentVal = arr[mid];

    if(currentVal < val){
      lo = mid + 1;
    }
    else if (currentVal > val) {
      hi = mid -1;
    }
    else {
      return arr[mid];
    }
  }

  return arr[mid];
}

function startAnimation(){
  timeAnimateId = setInterval(function(){
      changePosition();
    }, APG.ANIMATION_INTERVAL_MS
  );
}

function stopAnimation(){
  clearInterval(timeAnimateId);
}

function hideAndShow(){
  APG.$videoSource.toggleClass('hide');
}

function setDynamicConstants(){
  APG.demoBoxHeight = APG.$demoBox.height();
  APG.demoBoxWidth = APG.$demoBox.width();

  APG.offset = APG.$videoSource.offset();
  APG.videoOffsetTop = APG.offset.top;
  APG.videoOffsetLeft = APG.offset.left;APG.videoWrapperHeight = APG.$videoWrapper.height();

  APG.videoWrapperWidth = APG.$videoWrapper.width();
  APG.columnHelper = APG.videoWrapperWidth / APG.VIDEO_COLUMNS;
  APG.rowHelper = APG.videoWrapperHeight / APG.VIDEO_ROWS;
}