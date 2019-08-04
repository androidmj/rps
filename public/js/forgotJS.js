$(document).ready(function () {
  $('#forgot-button').on('click', function () {
    var email = $('#email').val();
    var button = $(this);
    var msgDiv =  $('#forgot-error');

    if (!validateEmail(email)) {
      msgDiv.html('Please enter a valid email');
      msgDiv.show();
      return;
    }

    button.hide();

    $.post('forgot.php', {e:email}, function (data){
      var json = $.parseJSON(data);
      if (json['message'] == 'success') {
        msgDiv.html('<br><br><span style="color:#000;">' + json['data'] + '</span>');
      } else {
        msgDiv.html(json['data']);
        button.show();
      }
      msgDiv.show();
    });
  });

  $('#reset-button').on('click', function () {
    var password = $('#pass').val();
    var msgDiv =  $('#forgot-error');
    var button = $(this);

    if (password.indexOf(' ') !== -1) {
      msgDiv.html('Password cannot contain spaces');
      msgDiv.show();
      return;
    }

    if (password.length < 8) {
      msgDiv.html('Password must be at least 8 characters');
      msgDiv.show();
      return;
    }

    if (password !== $('#passconf').val()) {
      msgDiv.html('Passwords do not match');
      msgDiv.show();
      return;
    }

    button.hide();

    $.post('forgot.php', {h:$('#s-hash').val(), id:$('#rpid').val(), p:password}, function(data){
      var json = $.parseJSON(data);
      if (json['message'] == 'success') {
        msgDiv.html('<br><br><span style="color:#000;">' + json['data'] + '</span>');
      } else {
        msgDiv.html(json['data']);
        button.show();
      }
      msgDiv.show();
    });

  });

});

function validateEmail(email) {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
};

function signup_error_message(message){
  $('#signup-error').html(message).fadeIn('slow');
  return false;
};

function has_number(string){
  matches = string.match(/\d+/g);
  if (matches != null) {
    return true;
  }
  return false;
};

function addDashes(f) {
  var r = /(\D+)/g,
    npa = '',
    nxx = '',
    last4 = '';
  f.value = f.value.replace(r, '');
  npa = f.value.substr(0, 3);
  if(f.value.length<4){return;}
  nxx = f.value.substr(3, 3);
  if(f.value.length<7){
    f.value = npa + '-' + nxx;
    return;
  }
  last4 = f.value.substr(6, 4);
  f.value = npa + '-' + nxx + '-' + last4;
};
