$(document).ready(function () {
  $( "#account-tabs" ).tabs().show();
  $('#my-name, #my-company, #my-floor, #my-section, #my-password, #my-cc').off('click').on('click', function (){
    if($('.wsite-button-blue').is(':visible')){
      return;
    }
    $(this).hide();
    $('#edit-' + $(this).attr('id')).show();
  });

  $('.cancel-button').off('click').on('click', function (){
    var type = $(this).data('type');
    $('#edit-my-' + type).hide();
    $('#my-' + type).show();
    switch(type){
      case 'section':
        $('#section-name').val($('#cur-section-name').html());
        break;

      case 'name':
        $('#first-name').val($('#cur-first-name').html());
        $('#last-name').val($('#cur-last-name').html());
        break;
    }
  });

  //Save button is pushed, if things look ok, ajax will change things
  $('.save-button').off('click').on('click', function (){
    var inputArray = {};
    var type = $(this).data('type');

    //Password is a special case
    if (type == 'password') {
      //new password
      var np = $('#password-np').val();

      //confirmed password
      var cp = $('#password-cp').val();

      if(np != cp){
        writeReturnMessage(type, 'Passwords do not match');
        return;
      }

      if(!validatePassword($('#password-op').val()) || !validatePassword(np) || !validatePassword(cp)){
        return;
      }
    }

    var editDiv = $('#edit-my-' + type);

    editDiv.find('input').each(function(){
      inputArray[$(this).attr('id')] = $(this).val();
    });

    //If we didn't find an input element, we probably have a select element (ex: for company name)
    if (Object.keys(inputArray).length == 0) {
      var select = editDiv.find('select');
      inputArray[select.attr('id')] = select.find('option:selected').text();
    }

    var returnDiv = editDiv.find('.return-message');
    var scButtons = editDiv.find('.sc-buttons');
    scButtons.hide();
    returnDiv.html('<img src="images/spinner.gif" />');

    $.post('changeaccount.php', inputArray, function (data){
      var json = $.parseJSON(data);
      returnDiv.html(json['message']);
      if (json['message'] == 'success') {
        $.each(inputArray, function (key, value){
          $('#cur-' + key).html(value);
        });

        setTimeout(function(){
          $('#edit-my-' + type).find('.cancel-button').click();
          returnDiv.html('');
          scButtons.show();
        },2000);
      } else {
        scButtons.show();
      }
    });
  });

  $('.cancel-order').off('click').on('click', function (){
    if(confirm('Cancel your order?')) {
      var but = $(this);
      but.hide();
      var msg = $('.cancel-order-message[data-orderid="' + but.data('orderid') + '"]');
      msg.show();
      $.post('refund.php', {'oid': $(this).data('orderid')}, function (data) {
        var json = $.parseJSON(data);
        if (json['message'] == 'success') {
          msg.html('canceled');
        } else {
          msg.html('failed');
        }
      });
    }
  });

  $('#daily-email').off('change').on('change', function(){
    $.post('ogmhelper', {'ogm':'aes','aes':$(this).val()});
  });

});

function validateEmail(email) {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
};

function error_message(message){
  $('#login-error').html(message).fadeIn('slow');
};

function signup_error_message(message){
  $('#signup-error').html(message).fadeIn('slow');
};

function has_number(string){
  matches = string.match(/\d+/g);
  if (matches != null) {
    return true;
  }
  return false;
};

function validatePassword(password){
  var returnDiv = $('#edit-my-password').find('.return-message');
  if (password.indexOf(' ') !== -1) {
    returnDiv.html('Password cannot contain spaces');
    return false
  }

  if (password.length < 8) {
    returnDiv.html('Password must be at least 8 characters');
    return false;
  }

  return true;
};

function writeReturnMessage(type, message){
  var returnDiv = $('#edit-my-' + type).find('.return-message').html(message);
};
