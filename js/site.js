$(function() {
    $(document).on('click tap', '#menu-button', event => {
        $('#menu-items').toggleClass('open');
    });
});
