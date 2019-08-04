$(document).ready(function () {
  $('.jqTransformSelectWrapper').off('click').on('click', function () {
    $(this).find('ul').toggle('fast');
  });

  $('.jqTransformSelectWrapper').find('li').off('click').on('click', function () {
    $(this).find('div').find('span').html('asdf');
  });
});