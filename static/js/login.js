$(document).ready(function () {

    $.ajax('/api/login/keep_login').done(function (response) {
        console.log(response)
        $('#keep_login').prop("checked", response);
    });


    $('#log-in').click(function () {
        let user = $('#username').val();
        let mp = $('#password').val();
        let keep_login = $('#keep_login').is(":checked") ? '1' : '0';
        let err = $('#wrong_credentials');

        $.ajax(`/api/login/auth/${user}/${mp}/${keep_login}`)
            .done(function (response) {
                if (response === true) {
                    err.text(' ');
                    window.location.replace($('#endpoint').text());
                } else {
                    err.text('Wrong username or password. Please try again');
                }
            })
            .fail(function (xhr, status, error) {
                if (xhr.status === '404') {
                    err.text('Wrong username or password. Please try again or go to hell');
                }
            });
    });
})