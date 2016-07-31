$(function() {
    $(document).on('vclick', '#menu-button', event => {
        $('#menu-items').toggleClass('open');
    });
});
