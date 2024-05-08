$(document).ready(function () {
    let body = $('body');
    let explorer = $('#explorer');
    let popup = $('#popup-context');

    let dir = '/';
    let row = 1;

    let popup_file = null;
    let canHide = true;

    let mousedown = false;
    let leftDragbar = false;
    let rightDragbar = false;

    let oldExplorerWidth = $(window).outerWidth();

    let keys = {};

    let selected_file = null;
    let dest = null;
    let is_cut = false;
    let clickagain = true;

    let w = oldExplorerWidth / 100 * 90 - 4;
    let explorerWidths = [w/3, 2, w/3, 2, w/3];
    
    $('#confirm-delete').hide();
    $('.dim').hide();

    get_folders(dir);

    $('.explorer-line').css('grid-template-columns',
        set_col_widths(explorerWidths));

    $('#bottom-spacer').css('height', window.innerHeight - 200);


    function format_dir(file) {
        return (dir === '/') ? dir + file : dir + '/' + file;
    }


    function get_folders(dir) {
        $('html').scrollTop(0);
        row = 1;
        add_location();
        add_return(dir);
        add_title();
        let encode_dir = btoa(dir)
        $.ajax(`/api/file_explorer/dirs/${encode_dir}`).done(function (data) {
            for (let dir in data){
                let date = data[dir][0];
                let size = data[dir][1];
                add_dir(dir, date, size);
            }
            $.ajax(`/api/file_explorer/files/${encode_dir}`).done(function (data) {
                for (let file in data){
                    let date = data[file][0];
                    let size = data[file][1];
                    add_file(file, date, size);
                }
            })
        })
        $('.explorer-line').css('grid-template-columns', set_col_widths(explorerWidths));
    }


    function add_row(file, date, size, nodiv = false) {
        let div = document.createElement('div');

        if (nodiv) {
            let p = document.createElement('p');
            p.className = 'explorer';
            p.style.cssText ='grid-column: 1/-1; border-width: 0';
            p.innerHTML = file + date + size;

            div.className = 'explorer-line';
            div.style.cssText = `grid-row: ${row}; border-width: 0 0 2px 0`;
            div.tabIndex = row;
            div.append(p);
            explorer.append(div);

        } else {
            let File = document.createElement('p');
            File.style.cssText = 'border-width: 0 2px 0 0;';
            File.className = "explorer name";
            File.innerHTML = file;

            let Date = document.createElement('p');
            Date.style.cssText = 'border-width: 0 2px 0 0;';
            Date.className = "explorer date";
            Date.innerHTML = date;

            let Size = document.createElement('p');
            Size.style.cssText = 'border-width: 0;';
            Size.className = "explorer size";
            Size.innerHTML = size;

            div.className = 'explorer-line';
            div.style.cssText = `grid-row: ${row}; border-width: 1px 0 0 0; grid-template-columns: ${set_col_widths(explorerWidths)};`;
            div.tabIndex = row;
            div.addEventListener('focusin', () => div.style.cssText += 'background-color: #404040;');
            div.addEventListener('focusout', () => div.style.cssText += 'background-color: #505050;');
            div.addEventListener('mouseover', () => div.style.cssText += 'background-color: #646464;');
            div.addEventListener('mouseout', () => div.style.cssText += (document.activeElement !== div) ? 'background-color: #505050;': 'background-color: #404040;');
            div.append(File, Date, Size);
            explorer.append(div);
        }
        row += 1;
        return div;
    }


    function add_dir(path, date, size) {
        let div = add_row('📁 ' + path, date, size);
        div.className = 'explorer-line dir';
        div.addEventListener('dblclick', function () {
            explorerWidths = colWidths();
            explorer.empty();
            dir = format_dir(path);
            get_folders(dir);
        })
        div.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            if (clickagain){
                popup_file = dir;
                popup.show();
                popup.css('top', event.pageY).css('left', event.pageX);
                add_popup_context(dir, false);
                clickagain = false;
            } else {
                popup.hide();
                clickagain = true;
            }
        })
    }


    function add_file(file, date, size) {
        let div = add_row('📄 ' + file, date, size)
        div.className = 'explorer-line file';
        div.addEventListener('dblclick', () => download_click(file, true));
        div.addEventListener('contextmenu', function (event) {
            event.preventDefault();
            if (clickagain){
                popup_file = file;
                popup.show();
                popup.css('top', event.pageY).css('left', event.pageX);
                add_popup_context(file, true);
                clickagain = false;
            } else {
                popup.hide();
                clickagain = true;
            }
        });
        div.addEventListener('mouseup', () => canHide = true);
        div.addEventListener('mousedown', () => { canHide = false })
    }


    function add_return(path) {
        let p = path.split('/');
        let new_path = path.slice(0, - p[p.length - 1].length - 1);
        if (new_path === '') {
            new_path = path;
        }
        let div = add_row('...', '', '', true);
        div.setAttribute('id', 'return');
        div.addEventListener('click', function () {
            explorerWidths = colWidths();
            explorer.empty();
            dir = new_path;
            get_folders(dir);
        })
        row += 1;
    }


    function add_location() {
        add_row(dir, '', '', true);
    }


    function add_title() {
        let name = document.createElement('p');
        name.innerHTML = "Name";
        name.id = "name";
        name.className = "explorer name";
        name.style.cssText = "border-width: 0; grid-column: 1 / 2";

        let leftDragbar = document.createElement('div');
        leftDragbar.id = "leftdragbar";
        leftDragbar.className = "dragbar";
        leftDragbar.style.cssText = "grid-column: 2 / 3";

        let date = document.createElement('p');
        date.innerHTML = "Date";
        date.id = "date";
        date.className = "explorer date";
        date.style.cssText = "border-width: 0; grid-column: 3 / 4";

        let rightDragbar = document.createElement('div');
        rightDragbar.id = "rightdragbar";
        rightDragbar.className = "dragbar";
        rightDragbar.style.cssText = "grid-column: 4 / 5";

        let size = document.createElement('p');
        size.id = "size";
        size.className = "explorer size";
        size.style.cssText = "border-width: 0; grid-column: 5 / 6";
        size.innerHTML = "Size";

        let title = document.createElement('div');
        title.id = "title";
        title.className = "explorer-line";
        title.style.cssText = `grid-row: ${row}; border-width: 0 0 1px 0`;
        title.tabIndex = row;

        title.append(name, leftDragbar, date, rightDragbar, size);
        explorer.append(title);
        row += 1;

        add_title_controls();
    }


    function add_title_controls() {
        $('#leftdragbar').mousedown(() => leftDragbar = true);


        $('#rightdragbar').mousedown(() => rightDragbar = true);


        $('.dragbar').mousedown(() => {
            mousedown = true;
            $('.explorer-line').css('user-select', 'none');
            body.css('cursor', 'e-resize');
        });
    }


    function add_popup_context(path, isfile=false) {
        popup.empty();

        let p_copy = document.createElement('p');
        p_copy.innerHTML = '📄 Copy';
        p_copy.addEventListener('click', () => {
            popup.hide();
            selected_file = format_dir(path);
            is_cut = false;
        });

        let p_cut = document.createElement('p');
        p_cut.innerHTML = '✂️ Cut';
        p_cut.addEventListener('click', () => {
            popup.hide();
            selected_file = format_dir(path);
            is_cut = true;
        })

        let p_del = document.createElement('p');
        p_del.innerHTML = '🗑 Delete';
        p_del.addEventListener('click', () => {
            popup.hide();
            selected_file = format_dir(path);
            del(true);
        });

        if (isfile) {
            var download = document.createElement('p');
            download.innerHTML = '📥 Download';
            download.addEventListener('click', () => {
                popup.hide();
                download_click(path);
            });

            popup.append(download, p_copy, p_cut, p_del);
        }
        else { popup.append(p_copy, p_cut, p_del); }
    }


    function download_click(file, open = false) {
        let path = btoa(format_dir(file));
        $.ajax(`/api/file_explorer/get_file/${path}`).done(
            function (f) {
                const aElement = document.createElement('a');
                aElement.href = '/api/file_explorer/get_file/' + path;
                aElement.click();
            })
    }


    function colWidths() {
        let val = $('.explorer-line').css('grid-template-columns');
        let widths = [];

        let tmp = '';
        for (let n in val){
            let i = val[n];
            if (i !== 'p' && i !== 'x' && i !== ' '){
                tmp += i;
            } else if (i === 'p'){
                widths.push(parseInt(tmp, 10));
                tmp = '';
            }
        }
        return widths;
    }


    function set_col_widths(widths) {
        let newColTemp = [];
        for (let c in widths) {
            newColTemp.push(Math.round(widths[c]).toString() + 'px');
        }
        return newColTemp.join(' ');
    }


    function copy() {
        $.ajax(`/api/file_explorer/copy/${btoa(selected_file)}/${btoa(dest)}`).done(
            (data) => {
                explorerWidths = colWidths();
                notification(`<span>${data[0]}</span> has been copied to <span>${data[1]}</span>`);
                explorer.empty();
                get_folders(dir);
            });
    }


    function cut() {
        $.ajax(`/api/file_explorer/cut/${btoa(selected_file)}/${btoa(dest)}`).done(
            (data) => {
                selected_file = null;
                dest = null;
                explorerWidths = colWidths();
                notification(`<span>${data[0]}</span> has been moved to <span>${data[1]}</span>`);
                explorer.empty();
                get_folders(dir);
            })
    }


    function del() {
        $('#confirm-text').html('Do you really want to delete <span>' + selected_file + '</span>');
        $('#confirm-delete').show();
        $('.dim').show();
    }

    function notification(message, doneFunc = null) {
        $('#notification-text').html(message);
        let notif = $('#notification');
        notif.toggleClass('hide', false);
        notif.toggleClass('show', true);
        setTimeout(() => {
            notif.toggleClass('show', false);
            notif.toggleClass('hide', true);
            if (doneFunc != null) {
                doneFunc();
            }
        }, 3000);
    }


    $('#dismiss').on('click', () => {
        $('#confirm-delete').hide();
        $('.dim').hide();
    });
    $('#confirm').on('click', () => {
        $.ajax(`/api/file_explorer/delete/${btoa(selected_file)}`).done(
            (data) => {
                selected_file = null;
                notification(`<span>${data}</span> has been deleted`);
                explorerWidths = colWidths();
                explorer.empty();
                get_folders(dir);
            });
        $('#confirm-delete').hide();
        $('.dim').hide();
    });


    body.mousemove(function (event) {
        if (mousedown) {
            let right;
            let middle;
            let left;
            let dragbarWidth = 2;
            let leftColWidth = $('#name').outerWidth();
            let rightColWidth = $('#size').outerWidth();
            let explorerWidth = window.innerWidth / 100 * 90;
            let mouseX = event.pageX - window.innerWidth / 100 * 5;

            if (leftDragbar){
                left = mouseX;
                middle = explorerWidth - 2 * dragbarWidth - rightColWidth - mouseX;
                right = rightColWidth;
            } else if (rightDragbar){
                left = leftColWidth;
                middle = mouseX - leftColWidth;
                right = explorerWidth - left - middle - 2 * dragbarWidth;
            } else {
                left = leftColWidth;
                middle = $('#date').outerWidth();
                right = rightColWidth;
            }

            let cols = [left, dragbarWidth, middle, dragbarWidth, right];

            $('.explorer-line').css('grid-template-columns', set_col_widths(cols));
        }
    })


    body.mousedown(function (event) {
        if (!$('#popup-context, #popup-context *').is(event.target)) {
            if (popup_file !== null) {
                popup_file = null;
                popup.hide();
                clickagain = true;
            }
        }
    })


    body.mouseup(() => {
        mousedown = leftDragbar = rightDragbar = false;
        $('.explorer-line').css('user-select', 'auto');
        body.css('cursor', 'default');
    });


    body.keydown((event) => {
        event.preventDefault();
        let key = event.key
        let activeClass = document.activeElement.className
        if (!keys[key]) {
            switch (key) {
                case 'c':
                    if ((activeClass === 'explorer-line dir' || activeClass === 'explorer-line file') && event.ctrlKey) {
                        selected_file = format_dir(document.activeElement.children.item(0).innerHTML.substring(3));
                        is_cut = false;
                    }
                    break;
                case 'x':
                    if ((activeClass === 'explorer-line dir' || activeClass === 'explorer-line file') && event.ctrlKey) {
                        selected_file = format_dir(document.activeElement.children.item(0).innerHTML.substring(3));
                        is_cut = true;
                    }
                    break;
                case 'Delete':
                    if (activeClass === 'explorer-line dir' || activeClass === 'explorer-line file') {
                        selected_file = format_dir(document.activeElement.children.item(0).innerHTML.substring(3));
                        del(activeClass === 'explorer-line file');
                    }
                    break;
                case 'v':
                    if (event.ctrlKey) {
                        if (activeClass === 'explorer-line dir') {
                            dest = format_dir(document.activeElement.children.item(0).innerHTML.substring(3));
                        } else {
                            dest = dir;
                        }

                        if (is_cut) {
                            cut();
                        } else {
                            copy();
                        }
                    }
                    break;
            }

            keys[key] = true;
        }
    })


    body.keyup((e) => keys[e.key] = false);


    document.addEventListener('mousedown', (e) => {
        switch (e.button) {
            case 3:
                e.preventDefault();
                $('#return').click();
                //TODO test with mouse
                break;
            default:
                break;
        }
    });


    $(window).on('resize', function () {
        let widths = colWidths();
        let explorerWidth = $(window).outerWidth();
        let ratio = oldExplorerWidth / explorerWidth;
        oldExplorerWidth = explorerWidth;
        let left = widths[0] / ratio;
        let middle = widths[2] / ratio;
        let right = widths[4] / ratio;
        let dragbar = widths[1];

        let cols = [left, dragbar, middle, dragbar, right];

        $('.explorer-line').css('grid-template-columns', set_col_widths(cols));

        $('#bottom-spacer').css('height', window.innerHeight - 100);
    });
});
