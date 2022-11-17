$(document).ready(function (){

    let red = $('#red');
    let green = $('#green');
    let blue = $('#blue');
    let white = $('#white');
    let alpha = $('#alpha');
    let color = $('#color');

    function width() { return window.innerWidth - 10 - 35 - 60; }
    
    
    function componentToHex(c) {
        let hex = parseInt(c).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    function updateColor() {
        let a = parseInt(alpha.val());
        let r = parseInt(red.val());
        let g = parseInt(green.val());
        let b = parseInt(blue.val());
        let w = parseInt(white.val());
        let rw = Math.min((r + w), 255);
        let gw = Math.min((g + w), 255);
        let bw = Math.min((b + w), 255);
        let hex = '#' +
            componentToHex(Math.round(Math.min((r + w), 255) / 100.0 * a)) +
            componentToHex(Math.round(Math.min((g + w), 255) / 100.0 * a)) +
            componentToHex(Math.round(Math.min((b + w), 255) / 100.0 * a));
        
        color.css('background-color', hex);
        $('#color_code').text(hex);
        alpha.css('background-image', `linear-gradient(to right, rgba(${rw}, ${gw}, ${bw}, 0), rgba(${rw}, ${gw}, ${bw}, 1))`)
        $.ajax({url: 'api/lights/update_color/' + [r, g, b, w, a].join('/'), type: 'PUT'});
        return hex;
    }
    
    function red_update() {
        $('#red_label').text(red.val());
        red.css('background-color', '#' + componentToHex(red.val()) + '0000');
    }
    
    function green_update() {
        $('#green_label').text(green.val());
        green.css('background-color', '#00' + componentToHex(green.val()) + '00');
    }
    
    function blue_update() {
        $('#blue_label').text(blue.val());
        blue.css('background-color', '#0000' + componentToHex(blue.val()));
    }
    
    function white_update() {
        $('#white_label').text(white.val());
        let hex = componentToHex(white.val());
        white.css('background-color', '#' + hex + hex + hex);
    }
    
    function alpha_update() {
        $('#alpha_label').text(alpha.val());
    }
    
    function update_all() {
        red_update();
        green_update();
        blue_update();
        white_update();
        alpha_update();
        updateColor();
    }

    
    update_all();

    red.css('width', width());
    green.css('width', width());
    blue.css('width', width());
    white.css('width', width());
    alpha.css('width', width());


    $(window).on('resize', function () {
        red.css('width', width());
        green.css('width', width());
        blue.css('width', width());
        white.css('width', width());
        alpha.css('width', width());
        if (color.width > 200 || color.height > 200) {}
    })
    
    $('.slider').on('input change', updateColor);

    red.change().on('input change', red_update);

    green.change().on('input change', green_update)

    blue.change().on('input change', blue_update)
    
    white.change().on('input change', white_update)

    alpha.change().on('input change', alpha_update)
    

    $('#log-out').click(function () {
        $.ajax('api/login/logout').done(function () {
            window.location.replace('/login');
        });
    });
    
    $('#white_button').click(function () {
        red.attr('value', 5);
        green.attr('value', 0);
        blue.attr('value', 10);
        white.attr('value', 255);
        alpha.attr('value', 100);
        update_all()
    })
});