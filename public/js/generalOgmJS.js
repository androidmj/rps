$(document).ready(function () {
  $('.daily-email-form').on('submit', function(e){
    var th = $(this);
    var email = th.find('.daily-email-address').val();
    var parentHack = th.parent().parent().parent().parent();

    if(validateEmail(email)) {
      parentHack.find('.daily-email-signup').hide();
      parentHack.find('.daily-email-ret-msg').show();

      $.post('signup.php', {des:email, det:th.find('.daily-placement').val()}, function(data){
        //thank you.
      });

      return false;
    }

    th.find('.daily-email-address').addClass('glowing-border');

    return false;
  });
});

function validateEmail(email) {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
};