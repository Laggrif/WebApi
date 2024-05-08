$(document).ready(function (){
    const url = "http://192.168.0.163:5000/api";

    let ledNum = 0;
    fetch(url + '/lights/color')
        .then(response => response.json())
        .then(data => {
            ledNum = data['END_LED'] - data['START_LED'];
            console.log('Strip contains ' + ledNum + ' leds');
        });


    function width() { return window.innerWidth - 10 - 35 - 60; }
    
    
    function componentToHex(c) {
        let hex = parseInt(c).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    function updateColor() {
        let alpha = $('#alpha')
        let a = parseInt(alpha.val());
        let r = parseInt($('#red').val());
        let g = parseInt($('#green').val());
        let b = parseInt($('#blue').val());
        let w = parseInt($('#white').val());
        let rw = Math.min((r + w), 255);
        let gw = Math.min((g + w), 255);
        let bw = Math.min((b + w), 255);
        let hex = '#' +
            componentToHex(Math.round(Math.min((r + w), 255) / 255.0 * a)) +
            componentToHex(Math.round(Math.min((g + w), 255) / 255.0 * a)) +
            componentToHex(Math.round(Math.min((b + w), 255) / 255.0 * a));
        
        $('#color').css('background-color', hex);
        $('#color_code').text(hex);
        alpha.css('background-image', `linear-gradient(to right, rgba(${rw}, ${gw}, ${bw}, 0), rgba(${rw}, ${gw}, ${bw}, 1))`)
        let data = {'color': {'all': [r, g, b, w]}};
        $.ajax({url: 'api/lights/color', type: 'PUT', data: JSON.stringify(data)});
        return hex;
    }
    
    function red_update() {
        let red = $('#red');
        $('#red_label').text(red.val());
        red.css('background-color', '#' + componentToHex(red.val()) + '0000');
    }
    
    function green_update() {
        let green = $('#green');
        $('#green_label').text(green.val());
        green.css('background-color', '#00' + componentToHex(green.val()) + '00');
    }
    
    function blue_update() {
        let blue = $('#blue');
        $('#blue_label').text(blue.val());
        blue.css('background-color', '#0000' + componentToHex(blue.val()));
    }
    
    function white_update() {
        let white = $('#white')
        $('#white_label').text(white.val());
        let hex = componentToHex(white.val());
        white.css('background-color', '#' + hex + hex + hex);
    }


    function alpha_update() {
        let alpha = $('#alpha').val();
        $.ajax({url: 'api/lights/color', type: 'PUT', data: JSON.stringify({'alpha': alpha})});
        $('#alpha_label').text(alpha);
    }

    function update_all() {
        red_update();
        green_update();
        blue_update();
        white_update();
        alpha_update();
        updateColor();
    }


    function resize_all() {
        $('#red').css('width', width());
        $('#green').css('width', width());
        $('#blue').css('width', width());
        $('#white').css('width', width());
        $('#alpha').css('width', width());
    }

    
    update_all();
    resize_all();


    $(window).on('resize', function () {
        resize_all();
    })
    
    $('.slider').on('input change', updateColor)

    $('#red').change().on('input change', red_update);

    $('#green').change().on('input change', green_update)

    $('#blue').change().on('input change', blue_update)
    
    $('#white').change().on('input change', white_update)

    $('#alpha').change().on('input change', alpha_update)
    

    $('#log-out').click(function () {
        $.ajax('api/login/logout').done(function () {
            window.location.replace('/login');
        });
    });


    function set_vals(r, g, b, w) {
        $('#red').val(r);
        $('#green').val(g);
        $('#blue').val(b);
        $('#white').val(w);
    }

    $('#black_button').click(function () {
        set_vals(0, 0, 0, 0);
        update_all();
    });

    $('#white_button').click(function () {
        set_vals(5, 0, 10, 255);
        update_all();
    });

    $('#red_button').click(function () {
        set_vals(255, 0, 0, 0);
        update_all();
    });

    $('#green_button').click(function () {
        set_vals(0, 255, 0, 0);
        update_all();
    });

    $('#blue_button').click(function () {
        set_vals(0, 0, 255, 0);
        update_all();
    });

    $('#pink_button').click(function () {
        set_vals(255, 0, 13, 0);
        update_all();
    });

    $('#lightblue_button').click(function () {
        set_vals(0, 0, 255, 70);
        update_all();
    });

    $('#dim_button').click(function () {
        $('#alpha').val(1);
        update_all();
    });

    $('#rainbow_button').click(function () {
        $.ajax({url: 'api/lights/rainbow', type: 'PUT'});
    });

    $('#strobe_button').click(function () {
        $.ajax({url: 'api/lights/strobe', type: 'PUT'});
    });

});