$(document).ready(function () {
    let explorer = $('#explorer')
    let explorer_line = $('.explorer-line');
    let dir = '^home^un';
    let row = 2;
    let File = null;
    let Date = null;
    let Size = null;
    
    let mousedown = false;
    let leftDragbar = false;
    let rightDragbar = false;
    
    let oldExplorerWidth = $(window).outerWidth();

    // data { file_name: [date, size], ...}
    
    get_folders(dir);
    
    let w = oldExplorerWidth / 100 * 90 - 4;
    explorer_line.css('grid-template-columns', 
        set_col_widths([w/3, 2, w/3, 2, w/3]));
    
    
    function get_folders(dir) {
        $.ajax(`/api/file_explorer/dirs/${dir}`).done(function (data) {
            for (let dir in data){
                let date = data[dir][0];
                let size = data[dir][1];
                add_dir(dir, date, size); //TODO add_dir à créer
            }
            $.ajax(`/api/file_explorer/files/${dir}`).done(function (data) {
                for (let file in data){
                    let date = data[file][0];
                    let size = data[file][1];
                    add_file(file, date, size);
                }
            })
        })
    }


    function colWidths() {
        let val = explorer_line.css('grid-template-columns');
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
            newColTemp.push(widths[c].toString() + 'px');
        }
        return newColTemp.join(' ');
    }


    function add_dir(path, date, size) {
        let div = add_row('D- ' + path, date, size);
        div.addEventListener('click', function () {
            alert(dir.replace(/\^/g, '/') + '/' + path);
        })
    }


    function add_file(file, date, size) {
        let div = add_row(file, date, size)
    }


    function add_row(file, date, size) {
        if (row > 2){
            File.style.cssText = 'border-width: 0px 2px 1px 2px;';
            Date.style.cssText = 'border-width: 0px 2px 1px 0px;';
            Size.style.cssText = 'border-width: 0px 2px 1px 0px;';
        }
        File = document.createElement('p');
        File.type = 'button';
        File.style.cssText = `border-width: 0px 2px 2px 2px;`;
        File.className = "explorer name";
        File.innerHTML = file;

        Date = document.createElement('p');
        Date.type = 'button';
        Date.style.cssText = `border-width: 0px 2px 2px 0px;`;
        Date.className = "explorer date";
        Date.innerHTML = date;

        Size = document.createElement('p');
        Size.type = 'button';
        Size.style.cssText = `border-width: 0px 2px 2px 0px;`;
        Size.className = "explorer size";
        Size.innerHTML = size;

        let div = document.createElement('div');
        div.className = 'explorer-line';
        div.style.cssText = `grid-row: ${row}`;
        div.tabIndex = row;
        div.append(File, Date, Size);
        explorer.append(div);

        /*div.addEventListener("click", function () {
            let bg = window.getComputedStyle(div, null).getPropertyValue('background-color');
            console.log(bg);
            if (bg === 'rgb(0, 0, 0)'){
                div.style.backgroundColor = '#ffffff';
            } else {
                div.style.backgroundColor = '#000000';
            }
        });*/

        row += 1;
        return div
    }
    
    
    $('#leftdragbar').mousedown(() => leftDragbar = true);
    
    
    $('#rightdragbar').mousedown(() => rightDragbar = true);
    
    
    $('.dragbar').mousedown(() => {
        mousedown = true;
        $('.explorer-line').css('cursor', 'e-resize')
            .css('user-select', 'none');
    });
    
    
    explorer.mouseup(() => {
        mousedown = leftDragbar = rightDragbar = false;
        $('.explorer-line').css('cursor', 'pointer')
            .css('user-select', 'auto');
    });
       
    
    explorer.mouseleave(() => {
        mousedown = leftDragbar = rightDragbar = false;
        $('.explorer-line').css('cursor', 'pointer')
            .css('user-select', 'auto');
    });
    
    
    explorer.mousemove(function (event) {
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
        
        explorer_line.css('grid-template-columns', set_col_widths(cols));
    })
});