$(document).ready(function () {
  $('#login-button').on('click', function () {
    if (!validateEmail($('#email').val())) {
      return error_message('Please enter a valid email');
    }

    var password = $('#pass').val();

    if (password.indexOf(' ') !== -1) {
      return error_message('Password cannot contain spaces');
    }

    if (password.length < 8) {
      return error_message('Password must be at least 8 characters');
    }

    $('#login-form').submit();
  });

  $('#create-account-button-create').on('click', function () {
    var string_to_check = $('#first-name').val();
    if (string_to_check.length < 2 || has_number(string_to_check)) {
      return signup_error_message('Please enter a valid first name');
    }

    string_to_check = $('#last-name').val();
    if (string_to_check.length < 2 || has_number(string_to_check)) {
      return signup_error_message('Please enter a valid last name');
    }

    if ($('#company-ca').val() == 0) {
      return signup_error_message('Please select your company');
    }

    //if ($('#floor-id').val() <= 0) {
    //  return signup_error_message('Please enter a valid floor');
    //}

    //string_to_check = $('#section-ca').val();
    //if (string_to_check.length < 2 || !has_number(string_to_check)) {
    //  return signup_error_message('Please enter a valid section');
    //}

    if (!validateCell($('#cell-ca').val())) {
      return signup_error_message('Please enter a valid cell phone number');
    }

    if (!validateEmail($('#email-ca').val())) {
      return signup_error_message('Please enter a valid email');
    }

    var password = $('#password-ca').val();

    if (password.indexOf(' ') !== -1) {
      return signup_error_message('Password cannot contain spaces');
    }

    if (password.length < 8) {
      return signup_error_message('Password must be at least 8 characters');
    }

    $('#signup-form').submit();
  });

  //show the create account form if create account button is pressed while log in div is shown.
  $('#create-account-button').on('click', function () {
    $('#login-div').hide();
    $('#desktop-login-popover-title').html('<h1>Create an Account</h1>');
    $('#create-account-div').show();
  });

  //show the log in form if log in button is pressed and create account is shown.
  $('#login-button-create').on('click', function () {
    $('#create-account-div').hide();
    $('#desktop-login-popover-title').html('<h1>Log In</h1>');
    $('#login-div').show();
  });

});

function validateEmail(email) {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
};

function validateCell(cell) {
  var re = /^\(?([2-9]{1}[0-9]{2})\)?[-]?([2-9]{1}[0-9]{2})[-]?([0-9]{4})$/;
  return re.test(cell);
};

function error_message(message){
  $('#login-error').html(message).fadeIn('slow');
  return false;
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
