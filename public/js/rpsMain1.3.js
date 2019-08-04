$(document).ready(function () {
  //mobile nav needs to function on click
  $(document).on('click', '#hamburger', function (e) {
    $('body').toggleClass('mobile-nav-open');
  });

  //set up flex slider
  $('.flexslider').flexslider({
    animation: "slide",
    directionNav: false,
    slideshowSpeed: 10000,
    animationLoop: true,
    start: function(){$('.flexslider').removeClass('placeholder-colorfix flexplaceholder');
                      $('.flex-viewport').addClass('flexplaceholder notransition');
    }
  });

  //on load function
  $(window).on('load', function() {
    //lazy load images
    $('img[data-src]').each(function(i, item){
      $(item).attr("src", $(item).data('src'));
    });
  });

  //name, email2, comments
  //send to php backend and send email to Steve
  $("form[name='contactForm']").on('submit', function (e){
    e.preventDefault();

    let form = $(this);
    let formButton = form.find('button');
    formButton.prop('disabled', true);

    let url = '/ajax/send_message';

    fetch('/contactus/send_message',{
      method: 'POST',
      body: new URLSearchParams(new FormData(form[0]))
    })
      .then( response => response.json() )
      .then( json => {
        if(json.data.success){
          form_response(true, json.message, formButton);
        } else {
          form_response(false, json.message, formButton)
        }
      } )
      .catch( error => {
        form_response(false, false, formButton);
      } );
  });
  //show the response after the contact us form is submitted
  function form_response(success, message, formButton) {
    let element = $('.form-group.message');

    if(message){
      element.html(message);
    }

    if(success) {
      $('.form-group').not('.message').hide();
    }

    element.show();
    formButton.prop('disabled', success);
  }
});