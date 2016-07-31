$(function() {
    $('#menu-button').on('mouseup touchend', event => {
        $('#menu-items').toggleClass('open');
    });
});
