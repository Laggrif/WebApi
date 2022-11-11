$(document).ready(function (){

    let red = $('#red');
    let green = $('#green');
    let blue = $('#blue');
    let color = $('#color');

    let width = window.innerWidth - 10 - 10 - 60;
    
    red.css('background-color', '#000000');
    green.css('background-color', '#000000');
    blue.css('background-color', '#000000');

    red.css('width', width);
    green.css('width', width);
    blue.css('width', width);


    function componentToHex(c) {
        let hex = parseInt(c).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    function updateColor(element) {
        let hex = '#' + componentToHex(red.val()) + componentToHex(green.val()) + componentToHex(blue.val());
        element.css('background-color', hex);
    }


    $(window).on('resize', function () {
        let width = window.innerWidth - 10 - 10 - 60;
        red.css('width', width);
        green.css('width', width);
        blue.css('width', width);
    })

    red.change().on('input change', function () {
        $('#red_label').text(red.val());
        updateColor(color);
        red.css('background-color', '#' + componentToHex(red.val()) + '0000');
    })

    green.change().on('input change', function () {
        $('#green_label').text(green.val());
        updateColor(color);
        green.css('background-color', '#00' + componentToHex(green.val()) + '00');
    })

    blue.change().on('input change', function () {
        $('#blue_label').text(blue.val());
        updateColor(color);
        blue.css('background-color', '#0000' + componentToHex(blue.val()));
    })

    $('#log-out').click(function () {
        $.ajax('api/login/logout').done(function () {
            window.location.replace('/login');
        });
    });
});