var interval = 0;

window.onload = function () {
    init();
}

function init() {
    addMouseDownEvent();
}

function addMouseDownEvent() {
    let fields = document.getElementsByClassName('field');
    for (const field of fields) {
        field.addEventListener("mousedown", whichButton);
    }
}

function whichButton(event) {
    let event_field = event.target;
    let fields = document.getElementsByClassName('field');
    first_click(fields);

    let mine_places = get_mine_places();
    let number_of_mines = mine_places.length;
    let actual_field_x = event_field.getAttribute("data-row");
    let actual_field_y = event_field.getAttribute("data-col");
    let index_of_field = get_place(fields, actual_field_x, actual_field_y);

    if (event.button === 2) {
        no_contextMenu();
        let flagged = get_flagged(fields);
        flagging(fields, index_of_field, number_of_mines, flagged)
    } else if (event.button === 0) {
        let neighbors = get_neighbors(index_of_field, fields);
        let mines_in_neighbors = check_neighbors(neighbors, mine_places);
        let background_list = get_background_list(fields);
        let rows = get_rows(fields);
        let cols = get_cols(fields);
        field_opening(mines_in_neighbors, index_of_field, fields, background_list, neighbors, mine_places, rows, cols, number_of_mines);
    }
}

function first_click(fields) {
    if (get_flagged(fields).length + get_background_list(fields).length === 0) {
        start_timer();
    }
}

function get_mine_places() {
    let mine_places = []
    let fields = document.getElementsByClassName('field');
    for (i = 0; i < fields.length; i++) {
        if (fields[i].className === 'field mine') {
            mine_places.push(i)
        }
    } return mine_places;
}

function get_place(fields, x, y) {
    for (let i = 0; i < fields.length; i++) {
        if ((fields[i].getAttribute("data-row") === x) && (fields[i].getAttribute("data-col") === y)) {
            return i;
        }
    }
}

function no_contextMenu() {
    let noContext = document.getElementById('noContextMenu');
    noContext.addEventListener('contextmenu', event => {
        event.preventDefault();
    });
}

function start_timer() {

    window.interval = window.setInterval(function () {
            stop_watch();
        }, 1000);

    let seconds = 0;
    let minutes = 0;

    function stop_watch() {
        let display_seconds = 0;
        let display_minutes = 0;

        seconds++;
        if (seconds / 60 === 1) {
            seconds = 0;
            minutes++;
        }

        if (seconds < 10) {
            display_seconds = "0" + seconds.toString();
        } else {
            display_seconds = seconds;
        }

        if (minutes < 10) {
            display_minutes = "0" + minutes.toString()
        } else {
            display_minutes = minutes
        }

        document.getElementById("elapsed-time-counter").value = display_minutes + ":" + display_seconds;
    }
}

function get_background_list(fields) {
    let background_list = []
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].style.background === 'url("/static/img/open-field.png")') {
            background_list.push(i);
        }
    } return background_list
}

function get_flagged(fields) {
    let flagged = []
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].style.background === 'url("/static/img/flag.png")') {
            flagged.push(i);
        }
    } return flagged
}

function get_rows(fields) {
    let rows = []
    for (let i = 0; i < fields.length; i++) {
        let row = fields[i].getAttribute("data-row");
        if (rows.includes(row) !== true) {
            rows.push(row);
        }
    }
    return rows.length
}

function get_cols(fields) {
    let cols = []
    for (let i = 0; i < fields.length; i++) {
        let col = fields[i].getAttribute("data-col");
        if (cols.includes(col) !== true) {
            cols.push(col);
        }
    }
    return cols.length
}

function flagging(fields, event_place, mines, flagged) {
    for (let i = 0; i < fields.length; i++) {
        if (i === event_place) {
            if ((fields[i].style.background !== 'url("/static/img/flag.png")') && (flagged.length < mines)) {
                if (fields[i].style.textAlign !== "center") {
                    fields[i].style.background = "url('/static/img/flag.png')";
                    let newest_flagged = get_flagged(fields)
                    update_mines_counter(mines, newest_flagged);
                }
            } else if ((fields[i].style.background === 'url("/static/img/flag.png")') && (flagged.length < mines + 1)) {
                fields[i].style.background = "url('/static/img/closed-field.png')";
                flagged.splice(flagged.indexOf(event_place), 1);
                let newest_flagged = get_flagged(fields);
                update_mines_counter(mines, newest_flagged);
            } else {
                alert("you don't have more mine");
            }
        }
    }
    return flagged;
}

function get_neighbors(actual_field_index, fields) {
    let int_x = parseInt(fields[actual_field_index].getAttribute("data-row"));
    let int_y = parseInt(fields[actual_field_index].getAttribute("data-col"));
    let neighbors = [];
    let neighbors_of_x = [int_x - 1, int_x, int_x + 1];
    let neighbors_of_y = [int_y - 1, int_y, int_y + 1];
    for (i = 0; i < neighbors_of_x.length; i++) {
        for (j = 0; j < neighbors_of_y.length; j++) {
            let neighbors_index = get_place(fields, neighbors_of_x[i].toString(), neighbors_of_y[j].toString());
            if ((neighbors_index !== actual_field_index) && (neighbors_index !== undefined)) {
                neighbors.push(neighbors_index);
            }
        }
    }
    return neighbors;
}

function check_neighbors(neighbors, mine_places) {
    let mines_in_neighbors = [];
    for (let i = 0; i < neighbors.length; i++) {
        if (mine_places.includes(neighbors[i])) {
            mines_in_neighbors.push(neighbors[i]);
        }
    }
    return mines_in_neighbors;
}

function field_opening(mines_in_neighbors, index_of_field, fields, background_list, neighbors, mine_places, rows, cols, mines) {
    for (let i = 0; i < fields.length; i++) {
        if (i === index_of_field) {
            if (fields[i].style.background !== 'url("/static/img/flag.png")') {
                let found_mine = mine_places.includes(index_of_field);
                if (found_mine === false) {
                    if (mines_in_neighbors.length !== 0) {
                        fields[i].style.background = "url('/static/img/open-field.png')";
                        fields[i].innerHTML = mines_in_neighbors.length;
                        give_to_opened_fields(index_of_field, background_list)
                    } else {
                        fields[i].style.background = "url('/static/img/open-field.png')";
                        give_to_opened_fields(index_of_field, background_list);
                        for (let j = 0; j < neighbors.length; j++) {
                            if (background_list.includes(neighbors[j]) === false) {
                                let index = j;
                                let neighbors_of_neighbor = get_neighbors(neighbors[j], fields);
                                let mines_in_neighbors_of_neighbor = check_neighbors(neighbors_of_neighbor, mine_places);
                                field_opening(mines_in_neighbors_of_neighbor, neighbors[index], fields, background_list, neighbors_of_neighbor, mine_places, rows, cols, mines);
                                j = index;
                            }
                            i = index_of_field;
                        }
                    }
                    fields[i].style.textAlign = "center";
                    if (is_win(background_list, rows, cols, mines)) {
                        alert("you won");
                        window.clearInterval(window.interval);
                        remove_attribute();
                    }
                } else {
                    fields[i].style.background = "url('/static/img/mine.png')";
                    fields[i].style.textAlign = "center";
                    is_loose(fields, mine_places);
                    alert("You loose this game :(");
                    window.clearInterval(window.interval);
                    remove_attribute();
                }
            } else if (fields[i].style.background === 'url("/static/img/flag.png")') {
                alert("You must to remove the flag at first.");
            }
        }
    }
}

function give_to_opened_fields(place, background_list) {
    if (background_list.includes(place) === false) {
        background_list.push(place);
    }
    return background_list;
}

function is_win(opened_fields, rows, cols, mines) {
    let open_fields = (rows * cols) - mines;
    return opened_fields.length === open_fields;
}

function is_loose(fields, mine_places) {
    for (i = 0; i < fields.length; i++) {
        for (j = 0; j < (mine_places).length; j++) {
            if (i === (mine_places)[j]) {
                fields[i].style.background = "url('/static/img/mine.png')";
            }
        }
    }
}

function update_mines_counter(mines, flagged) {
    let mines_2 = document.getElementById("mine-left-counter");
    mines_2.value = (mines - flagged.length)
}

function remove_attribute() {
    console.log("remove attribute");
    let fields = document.getElementsByClassName('field');
    for (const field of fields) {
        field.removeEventListener('mousedown', whichButton);
    }
}


