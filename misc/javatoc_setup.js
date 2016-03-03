// shorthand the selector
function sel(s) {
    return document.querySelector(s);
}

function selall(s) {
    return document.querySelectorAll(s);
}

function setupPermalinks() {
    var headers = selall('h2');

    for (var i = 0; i < headers.length; i++) {
        if (!headers[i].id) {
            console.log(headers[i] + ' name undefined!');
        } else {
            headers[i].innerHTML +=
            '<a class="permalink" title="Permalink to this section." href="#' +
            headers[i].getAttribute('id') +
            '">&#182;</a>';
        }
    }
}

function setupBackToTop() {
    // browser window scroll (in pixels) after which the "back to top" link is shown
    var offset = 300,
        //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
        offset_opacity = 1200,
        //duration of the top scrolling animation (in ms)
        scroll_top_duration = 700,
        //grab the "back to top" link
        $back_to_top = $('.to-top');

    //hide or show the "back to top" link
    $(window).scroll(function(){
        ( $(this).scrollTop() > offset )
        ? $back_to_top.addClass('cd-is-visible')
        : $back_to_top.removeClass('cd-is-visible');
    });

    //smooth scroll to top
    $back_to_top.on('click', function(event){
        event.preventDefault();
        $('body,html').animate({
            scrollTop: 0 ,
             }, scroll_top_duration
        );
    });
}

function main() {
    setupPermalinks();
    setupBackToTop();
}

main();
