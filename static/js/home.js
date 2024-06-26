$(document).ready(function () {
    let add = $('#add_time');
    let stop = $('#stop_time');
    let subtract = $('#subtract_time');
    let title = $('#welcome');

    // initially counter is stopped
    let what = 'stop';
    let interval = stopInterval();

    resizeImage();


    function resizeImage() {
        let width = 1920;
        let height = 1080;
        const rat = width / height;
        let wind = $(window);
        const winWidth = wind.outerWidth();
        const winHeight = wind.outerHeight() - 80;

        if (height !== winHeight) {
            let perc = height / winHeight;
            newHeight = winHeight;
            newWidth = width / perc;
            if (newWidth > winWidth) {
                perc = width / winWidth;
                newWidth = winWidth;
                newHeight = height / perc;
            }
        }
        $('#webcam').css('height', newHeight + 'px').css('width', newWidth + 'px');
    }


    function addInterval() {
        what = 'add';
        add.css('background-color','#d5d4d4')
            .css('color', '#505050');
        stop.css('background-color','#505050')
            .css('color', '#d5d4d4');
        subtract.css('background-color','#505050')
            .css('color', '#d5d4d4');
        return setInterval(function () {
            $.ajax({
                url: '/api/time/add',
                success: function (data) {
                    $('#connect_time').html(data);
                }
            })
        }, 1000)
    }

    function stopInterval() {
        what = 'stop';
        stop.css('background-color','#d5d4d4')
            .css('color', '#505050');
        add.css('background-color','#505050')
            .css('color', '#d5d4d4');
        subtract.css('background-color','#505050')
            .css('color', '#d5d4d4');
        return null;
    }

    function subtractInterval() {
        what = 'subtract';
        subtract.css('background-color', '#d5d4d4')
            .css('color', '#505050');
        add.css('background-color', '#505050')
            .css('color', '#d5d4d4');
        stop.css('background-color', '#505050')
            .css('color', '#d5d4d4');
        return setInterval(function () {
            $.ajax({
                url: '/api/time/sub',
                success: function (data) {
                    $('#connect_time').html(data);
                }
            })
        }, 1000)
    }


    // Add functions when clicking on buttons
    add.click(function () {
        clearInterval(interval);
        interval = (what === 'add') ? stopInterval(): addInterval();
    });

    stop.click(function () {
        clearInterval(interval);
        interval = stopInterval();
    });

    subtract.click(function () {
       clearInterval(interval);
       interval = (what === 'subtract') ? stopInterval(): subtractInterval();
    });


    $('#log-out').click(function () {
        $.ajax('api/login/logout').done(function () {
            window.location.replace('/login');
        });
    });


    $(window).on('resize', () => { resizeImage(); });

    /*
    // refresh picture from disk
    setInterval(function () {
        $.ajax({
            url: '/api/webcam',
            success: function (data) {
                d = new Date()
                $('#webcam').attr("src", "static/images/webcam0.jpeg?" + d.getTime());
            }
        });
    }, 100);
    */

})
