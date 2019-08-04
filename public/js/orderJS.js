$(document).ready(function () {
  var PlaceOrderAndCartButton = $('.place-order-button, #checkout-icon');

  PlaceOrderAndCartButton.off('click').on('click', function(){
    $('#order-success-msg').html('').hide();
    $('#place-order-pop-title').html('Place Order');

    var overlay = $('#order-overlay');
    overlay.find('.bodyView').show();
    overlay.show().addClass('overlayViewOgm').addClass('active', {duration:200});
    bodyFreeze();

    $.post('ogmhelper.php', {'ogm':'cmow'}, function(data){
      var json = $.parseJSON(data);
      if (json['message'] != '') {
        $('#order-error').html(json['message']);
      } else {
        $('#order-error').html('');
      }
    });

    var noAdd = 1;
    if ($(this).attr('id') != 'checkout-icon') {
      noAdd = 0;
    }

    $.post('ogmhelper.php', {'ogm': 'cart_view', 'no_add': noAdd, 'pickup': $(this).data('pickup')}, function (data) {
      $('#cart_table_view').html(data);
      $('#order-details').show();
      refreshCartNumber();
    });
  });

  $('.show-cart').on('click', function (){
    showCart();
  });

  $('.add-to-cart-button').off('click').on('click', function(){
    var th = $(this);
    th.off('click');
    var mid = th.data('mid');

    var pickup = ($(this).data('pickup') == 1) ? 1 : 0;

    $.post('addtocart.php', {'mid':mid, 'num':1, 'pickup':pickup}, function(data){
      var json = $.parseJSON(data);
      if (json['message'] != 'success') {
        if (json['message'] == 'Not logged in') {
          $('.place-order-button').first().click();
          return;
        }

        $('#order-error').html(json['message']);
      } else {
        $('#order-error').html('');
        setCartNumber(json['data']);
        th.hide();
        $('.added-to-cart[data-mid="' + mid + '"]').show();
      }
    });
  });

  $('.close.right').off('click').on('click', function(){
    var overlay = $('#order-overlay');
    overlay.find('.bodyView').hide('fast');
    bodyUnfreeze();
    overlay.removeClass('active', {duration:200}).removeClass('overlayViewOgm').hide();
    history.back();
  });

  var OgmOrderTotal = $('#order-total');

  $('#place-order').off('click').on('click', function (){
    var errDiv = $('#order-error');

    if ($('#cc-info').css('display') == 'none') {
      errDiv.html('Please add a payment method.');
      return;
    }

    var th = $(this);
    var load = $('#po-load-div');
    errDiv.html('');
    th.hide();
    load.show();
    //$.post('placeorder.php', {'pid': OgmOrderTotal.data('pid'), 'mid':OgmOrderTotal.data('meal-id'), 'num':OgmOrderQty.val()}, function (data){
    $.post('placeorder.php', {'pid': 1, 'mid':1, 'num':1}, function (data){
      var json = $.parseJSON(data);
        load.hide();

        if (json['message'] == 'success') {
          $('#order-details').hide();
          $('#order-success-msg').html(json['data']).show();
          $('#place-order-pop-title').html(json['title']);

          setCartNumber(0);
        } else {
          errDiv.html(json['message']);
          th.show();
        }
    });
  });

  // Immutable hash state identifiers.
  var openModalHashStateId = "#modalOpen";

  /* Updating the hash state creates a new entry
   * in the web browser's history. The latest entry in the web browser's
   * history is "modal.html#modalClosed". */
  //window.location.hash = closedModalHashStateId;
  $(window).on('hashchange', function(){
    // Alerts every time the hash changes!
    if(window.location.hash != openModalHashStateId) {
      $('#order-overlay').hide();
    }
  });

  firstLoad = true;
  /* The latest entry in the web browser's history is now "modal.html#modalOpen".
   * The entry before this is "modal.html#modalClosed". */
  PlaceOrderAndCartButton.on('click', function(e) {
    if (firstLoad && getParameterByName('o')) {
      window.history.pushState({'t':1}, 't', '');
    }

    firstLoad = false;
    window.location.hash = openModalHashStateId;
  });

  refreshCartNumber();

});

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

function removeMeal(th, mealId, pickup) {
  $(th).hide();
  $.post('addtocart.php', {'mid':mealId, 'pickup': pickup}, function(data){
    var json = $.parseJSON(data);
    console.log(json);
    if (json['message'] != 'success') {
      $('#order-error').html(json['message']);
    } else {
      var mealTotal;
      var orderTotal = 0;
      var mealIdForLoop;

      $('#order-error').html('');
      setCartNumber(json['data']);

      //Remove the meal
      $('.meal_row_' + mealId + '_' + pickup).remove();

      //Recalculate the total
      $('.chg-qty').each(function(i){
        mealIdForLoop = $(this).data('mid');
        mealTotal = $(this).val() * $(this).data('price');
        $('.option_price_' + mealIdForLoop).html(mealTotal.toFixed(2));
        orderTotal += mealTotal;
      });

      rewardDollars = parseFloat($('#reward_dollars').text());

      //Show the amount of reward dollars we can use. Actual reward dollars used is calculated on the backend.
      if(rewardDollars >= orderTotal) {
        $('#reward_dollars_shown').html(orderTotal.toFixed(2));
      } else {
        $('#reward_dollars_shown').html(rewardDollars.toFixed(2));
      }

      $('#order-subtotal').html(orderTotal.toFixed(2));
      orderTotal = Math.max(orderTotal - rewardDollars, 0);
      var tax = orderTotal * 0.0625;
      $('#order-tax').html(tax.toFixed(2));
      $('#order-total').html((orderTotal + tax).toFixed(2));
    }
  });
};

function refreshCartNumber(){
  $.post('ogmhelper.php', {'ogm': 'refresh_cart'}, function (data) {
    var json = $.parseJSON(data);
    var n = json['data'];
    if (!isNaN(parseFloat(n)) && isFinite(n)) {
      $('.items-in-cart').html(n);

    }
  });
};

function setCartNumber(n){
  $('.items-in-cart').html(n);
};

function showCart(){
  var ch = $('#checkout-icon');
  if(ch.length) {
    ch.click();
    return;
  }
  $('.place-order-button').first().click();
};

function bodyFreeze(){
  $('body').addClass('noscroll');
};

function bodyUnfreeze(){
  $('body').removeClass('noscroll');
};