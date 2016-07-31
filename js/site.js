$(function() {
    $(document).on('tap', '#menu-button', event => {
        $('#menu-items').toggleClass('open');
    });
});
