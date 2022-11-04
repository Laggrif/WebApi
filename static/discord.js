function notification(message, doneFunc = null) {
    $('#notification-text').text(message);
    let notif = $('#notification');
    notif.toggleClass('hide', false);
    notif.toggleClass('show', true);
    setTimeout(function() {
        notif.toggleClass('show', false);
        notif.toggleClass('hide', true);
    if (doneFunc != null) {
        doneFunc();
    }
    }, 1500);
}

$(document).ready(function () {

    $('#restart').click(function () {
        notification('Restarted');
        $.ajax({
            url: '/api/discord/restart',
            success: function (data) {
                $('#restart').attr('disabled', true);
                setTimeout(function () {
                    $('#restart').attr('disabled', false);
                }, 1000);
            }
        });
    });


    $('#display').click(function () {
        $.ajax({
            url: '/api/discord/display',
            success: function (data) {

                let checkbox = $('#display');
                checkbox.prop('disabled', true);
                notification('Display is ' + data, function () {
                    checkbox.prop('disabled', false);
                });
            }
        });
    });
})