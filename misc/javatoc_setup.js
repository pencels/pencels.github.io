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
        if (!headers[i].name) {
            console.log(headers[i] + ' name undefined!');
        }
        headers[i].innerHTML +=
        '<a class="permalink" title="Permalink to this section." href="#' +
        headers[i].getAttribute('id') +
        '">&#182;</a>';
    }
}

function main() {
    setupPermalinks();
}

main();
