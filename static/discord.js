const api_but = document.getElementById("change-api");

function reload_api() {
    $.ajax({
        api_but.style.color = '#000000'
    })
}

api_but.addEventListener('click', function onClick() {
    reload_api();
});