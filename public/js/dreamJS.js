$(document).ready(function(){


  currentActions = new currentActionObject();
  var buddy = $(".buddy");

  buddy.on("swiperight",function(){
    $(this).addClass('rotate-left').delay(800).fadeOut(1);
    $('.buddy').find('.status').remove();

    $(this).append('<div class="status like">Save!</div>');
    if ( $(this).is(':last-child') ) {
      $('.buddy:nth-child(1)').removeClass ('rotate-left rotate-right').fadeIn(200);
    } else {
      $(this).next().removeClass('rotate-left rotate-right').fadeIn(200);
    }
    currentActions.addHeart();
  });

  $('#tinder-super').on("click",function(){
    th = $('.buddy:visible');
    th.addClass('rotate-left').delay(800).fadeOut(1);
    $('.buddy').find('.status').remove();

    th.append('<div class="status super-like">Favorite!</div>');
    if ( th.is(':last-child') ) {
      $('.buddy:nth-child(1)').removeClass ('rotate-left rotate-right').fadeIn(200);
    } else {
      th.next().removeClass('rotate-left rotate-right').fadeIn(200);
    }
    currentActions.addSuper();
  });

  buddy.on('swipeup', function(){
    $('#tinder-super').click();
  });

  buddy.on("swipeleft",function(){
    $(this).addClass('rotate-right').delay(800).fadeOut(1);
    $('.buddy').find('.status').remove();
    $(this).append('<div class="status dislike">Next!</div>');

    if ( $(this).is(':last-child') ) {
      $('.buddy:nth-child(1)').removeClass ('rotate-left rotate-right').fadeIn(200);
      //alert('Na-na!');
    } else {
      $(this).next().removeClass('rotate-left rotate-right').fadeIn(200);
    }
    currentActions.addBlank();
  });

  //buddy.on("swipeup",function(){
  //  $(this).addClass('rotate-up').delay(200).fadeOut(1);
  //  $('.buddy').find('.status').remove();
  //  $(this).append('<div class="status dislike">Next!</div>');
  //
  //  if ( $(this).is(':last-child') ) {
  //    $('.buddy:nth-child(1)').removeClass ('rotate-left rotate-right rotate-up').fadeIn(200);
  //    //alert('Na-na!');
  //  } else {
  //    $(this).next().removeClass('rotate-left rotate-right rotate-up').fadeIn(200);
  //  }
  //});

  buddy.on("click",function(){
    activeBuddy = $(this).attr('id');
    $('#tinder-buttons').hide();
    $('#stats').hide();
    $('#dummy-cont').hide();
    $('#buddyzoomimg').attr("src",$(this).find('.avatar').data('img'));
    $(this).find('.card-title').hide();
    $(this).find('.avatar').addClass('animate-enlarge');
    setTimeout(function(){$('#' + activeBuddy).hide();},500);
    $('#buddyzoom').show();
    dreamDrag();
  });

  firstStatsClick = true;

  $('#stats').on("click",function(){
    $('#favs').show();

    if(firstStatsClick){
      firstStatsClick = false;
      statsDrag();
    }

    $('.like-card').off('click').on("click",function(){
      var buddy = $('.buddy');
      buddy.hide();
      $('#favs').hide();
      var th = $('.avatar[data-img="' + $(this).attr('src') + '"]').parent();
      activeBuddy = th.attr('id');
      $('#tinder-buttons').hide();
      $('#stats').hide();
      $('#dummy-cont').hide();
      $('#buddyzoomimg').attr("src", th.find('.avatar').data('img'));
      $(this).find('.card-title').hide();
      $(this).find('.avatar').addClass('animate-enlarge');
      setTimeout(function(){$('#' + activeBuddy).hide();},500);
      $('#buddyzoom').show();
      dreamDrag();
      buddy.removeClass('rotate-right');
      buddy.removeClass('rotate-left');
    });
  });

  $("#buddyzoomimg").on("click",function(){
    $('#buddyzoom').hide();
    $('#' + activeBuddy).show();
    setTimeout(function(){
      $('#' + activeBuddy).find('.avatar').removeClass('animate-enlarge');
      $('#' + activeBuddy).find('.card-title').show();
    },50);
    $('#dummy-cont').show();
    $('#tinder-buttons').show();
    $('#stats').show();
  });

  $("#tinder-next").on("click",function(){
    $('.buddy:visible').swipeleft();
  });

  $("#tinder-save").on("click",function(){
    $('.buddy:visible').swiperight();
  });

  $("#tinder-back").off("click").on("click",function(){
    th = $('.buddy:visible');
    th.addClass('rotate-right').delay(200).fadeOut(1);
    $('.buddy').find('.status').remove();
    //$(this).append('<div class="status dislike">Next!</div>');

    if ( th.is(':first-child') ) {
      $('.buddy:last-child').removeClass ('rotate-left rotate-right').fadeIn(200);
    } else {
      th.prev().removeClass('rotate-left rotate-right').fadeIn(200);
    }
    currentActions.revertAction();
  });

  $(".dragend-page-0").on("click", function() {
    $("#dsdragend").dragend({
      scrollToPage: 1
    });
    $('.header-highlight').removeClass('header-highlight');
    $('.dragend-page-0').addClass('header-highlight');
  });
  $(".dragend-page-1").on("click", function() {
    $("#dsdragend").dragend({
      scrollToPage: 2
    });
    $('.header-highlight').removeClass('header-highlight');
    $('.dragend-page-1').addClass('header-highlight');
  });

  testOrientation('');

  $(window).on('orientationchange', function (e)
  {
    testOrientation(e.orientation);
  });
});

function dreamDrag(){
  $("#dsdragend").dragend( {
    afterInitialize: function () {
      $("#dsdragend").css("visibility", "visible");
    },
    onDragEnd: function () {
      //this.page, this.pageCount, this.container, activeElement
      $('.header-highlight').removeClass('header-highlight');
      $('.dragend-page-' + this.page).addClass('header-highlight');
    },
    minDragDistance:50
  });
};

function statsDrag(){
  $("#dsdragend-fav").dragend( {
    afterInitialize: function () {
      $("#dsdragend-fav").css("visibility", "visible");
    },
    onDragEnd: function () {
      //this.page, this.pageCount, this.container, activeElement
      $('.header-highlight').removeClass('header-highlight');
      $('.dragend-page-' + this.page).addClass('header-highlight');
    },
    minDragDistance:50
  });
};

function currentActionObject(){
  this.currentActions = [];

  this.addHeart = function(){
    var hc = $('#heartcount');
    hc.html(parseInt(hc.html())+1);
    this.currentActions.push('h');
  };

  this.addSuper = function(){
    var hc = $('#supercount');
    hc.html(parseInt(hc.html())+1);
    this.currentActions.push('s');
  };

  this.addBlank = function(){
    this.currentActions.push('n');
  };

  this.revertAction = function(){
    if (this.currentActions.length) {
      var p = this.currentActions.pop();
      switch (p){
        case 'h':
          var hc = $('#heartcount');
          hc.html(parseInt(hc.html())-1);
          break;

        case 's':
          var sc = $('#supercount');
          sc.html(parseInt(sc.html())-1);
          break;
      }
    }
  };
};


var supportTouch = $.support.touch,
  scrollEvent = "touchmove scroll",
  touchStartEvent = supportTouch ? "touchstart" : "mousedown",
  touchStopEvent = supportTouch ? "touchend" : "mouseup",
  touchMoveEvent = supportTouch ? "touchmove" : "mousemove";
$.event.special.swipeupdown = {
  setup: function() {
    var thisObject = this;
    var $this = $(thisObject);
    $this.bind(touchStartEvent, function(event) {
      var data = event.originalEvent.touches ?
          event.originalEvent.touches[ 0 ] :
          event,
        start = {
          time: (new Date).getTime(),
          coords: [ data.pageX, data.pageY ],
          origin: $(event.target)
        },
        stop;

      function moveHandler(event) {
        if (!start) {
          return;
        }
        var data = event.originalEvent.touches ?
          event.originalEvent.touches[ 0 ] :
          event;
        stop = {
          time: (new Date).getTime(),
          coords: [ data.pageX, data.pageY ]
        };

        // prevent scrolling
        if (Math.abs(start.coords[1] - stop.coords[1]) > 10) {
          event.preventDefault();
        }
      }
      $this
        .bind(touchMoveEvent, moveHandler)
        .one(touchStopEvent, function(event) {
          $this.unbind(touchMoveEvent, moveHandler);
          if (start && stop) {
            if (stop.time - start.time < 1000 &&
              Math.abs(start.coords[1] - stop.coords[1]) > 30 &&
              Math.abs(start.coords[0] - stop.coords[0]) < 75) {
              start.origin
                .trigger("swipeupdown")
                .trigger(start.coords[1] > stop.coords[1] ? "swipeup" : "");
            }
          }
          start = stop = undefined;
        });
    });
  }
};
$.each({
  swipeup: "swipeupdown"
}, function(event, sourceEvent){
  $.event.special[event] = {
    setup: function(){
      $(this).bind(sourceEvent, $.noop);
    }
  };
});
function testOrientation(orientation) {
  switch(orientation){
    case '':
      var sc = (window.innerHeight > window.innerWidth ) ? 'none' : 'block';
      $('#block_land').css('display', sc);
      break;

    case 'landscape':
      $('#block_land').css('display', 'block');
      break;

    default:
      $('#block_land').css('display', 'none');
      break;
  }
};