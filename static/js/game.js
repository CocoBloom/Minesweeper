document.body.addEventListener(("mousedown"), whichButton_2);

let fields = document.getElementsByClassName('field');
for (const field of fields) {
    field.addEventListener("onmousedown", whichButton);
}

let seconds = 0;
let minutes = 0;
let display_seconds = 0;
let display_minutes = 0;
let interval = null;
let status = "stopped"
let count = 0;
let endOfGame = false;

function whichButton_2(event) {
    if (event.button === 2) {
        no_contextMenu()
    }
    if (count === 1) {
        start_stop()
    }
}

function stop_watch() {
    seconds++
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


function start_stop() {
    if (status === "stopped") {
        interval = window.setInterval(stop_watch, 1000);
        status = 'started'
    }
    else {
        window.clearInterval(interval);
        status = 'stopped'
    }

}




function get_mine_places() {
    let mine_places = []
    let fields = document.getElementsByClassName('field');
    for (i = 0; i < fields.length; i++) {
        if (fields[i].className === 'field mine') {
            mine_places.push(i)
        }
    } return mine_places
}


function send_data() {
    let datas_form = []
    let x = document.getElementById('form').elements;
    for (let i = 0; i < x.length; i++) {
        datas_form.push(x[i].value)
    }
    return datas_form
}




function whichButton(event) {
    if(endOfGame) {
        return;
    }

    count++
    let fields = document.getElementsByClassName('field');
    let background_list = get_background_list(fields);
    let mine_places = get_mine_places();
    let mines = mine_places.length
    let name = event.target;
    console.log("name", name);
    let rows = get_rows(fields);
    let cols = get_cols(fields)
    let x = name.getAttribute("data-row");
    let y = name.getAttribute("data-col");
    let place = get_place(fields, x, y);
    if (event.button === 2) {
        no_contextMenu();
        let flagged = get_flagged(fields);
        flagging(fields, name, x, y, place, mines, flagged)
    }
    else if (event.button === 0) {
        let neighbors = get_neighbors(place, x, y, fields);
        let mines_in_neighbors = check_neighbors(neighbors, mine_places);
        field_opening(mines_in_neighbors, place, x, y, fields, background_list, neighbors, mine_places, rows, cols, mines, status);
    }
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


function flagging(fields, name, x, y, place_2, mines, flagged) {
    console.log("flaged in flagging", flagged)
    for (i = 0; i < fields.length; i++) {
        if ((fields[i].getAttribute("data-row") === x) && (fields[i].getAttribute("data-col") === y)) {
            if ((fields[i].style.background !== 'url("/static/img/flag.png")') && (flagged.length < mines)) {
                if (fields[i].style.textAlign !== "center") {
                    fields[i].style.background = "url('/static/img/flag.png')";
                    let newest_flagged = get_flagged(fields)
                    update_mines_counter(mines, newest_flagged);
                }
            } else if ((fields[i].style.background === 'url("/static/img/flag.png")') && (flagged.length < mines + 1)) {
                fields[i].style.background = "url('/static/img/closed-field.png')";
                flagged.splice(flagged.indexOf(place_2), 1);
                let newest_flagged = get_flagged(fields);
                update_mines_counter(mines, newest_flagged);
            } else {
                alert("you don't have more mine");
            }
        }
    }
    return flagged;
}

function get_neighbors(place, x, y, fields) {
    let m_x = parseInt(x);
    let m_y = parseInt(y);
    let neighbors = []
    let neighb_x = [m_x - 1, m_x, m_x + 1];
    let neighb_y = [m_y - 1, m_y, m_y + 1];
    for (i = 0; i < neighb_x.length; i++) {
        for (j = 0; j < neighb_y.length; j++) {
            let neighb_place = get_place(fields, neighb_x[i].toString(), neighb_y[j].toString());
            if ((neighb_place !== place) && (neighb_place !== undefined)) {
                neighbors.push(neighb_place);
            }
        }
    } return neighbors
}

function compareNumbers(a, b) {
    return a - b;
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

function field_opening(mines_in_neighbors, place, x, y, fields, background_list, neighbors, mine_places, rows, cols, mines, status) {
    let attribute = "onmousedown";
    let attribute_2 = "onclick";
    for (i = 0; i < fields.length; i++) {
        if ((fields[i].getAttribute("data-row") === x) && (fields[i].getAttribute("data-col") === y)) {
            if (fields[i].style.background !== 'url("/static/img/flag.png")') {
                let found_mine = mine_places.includes(place);
                if (found_mine === false) {
                    if (mines_in_neighbors.length !== 0) {
                        fields[i].style.background = "url('/static/img/open-field.png')";
                        fields[i].innerHTML = mines_in_neighbors.length;
                        give_to_opened_fields(place, background_list)
                    } else {
                        fields[i].style.background = "url('/static/img/open-field.png')";
                        give_to_opened_fields(place, background_list);
                        for (j = 0; j < neighbors.length; j++) {
                            if (background_list.includes(neighbors[j]) === false) {
                                let index = j;
                                let x_auto = fields[neighbors[j]].getAttribute("data-row");
                                let y_auto = fields[neighbors[j]].getAttribute("data-col");
                                let neighbors_of_neighbor = get_neighbors(neighbors[j], x_auto, y_auto, fields);
                                let mines_in_neighbors_of_neighbor = check_neighbors(neighbors_of_neighbor, mine_places);
                                field_opening(mines_in_neighbors_of_neighbor, neighbors[index], x_auto, y_auto, fields, background_list, neighbors_of_neighbor, mine_places, rows, cols, mines, status);
                                j = index
                            }
                            i = place
                        }
                    }
                    fields[i].style.textAlign = "center";
                    if (is_win(background_list, rows, cols, mines) === 'true') {
                        alert("you won");
                        endOfGame = true;
                        remove_attribute(attribute, fields);
                    }
                } else {
                    fields[i].style.background = "url('/static/img/mine.png')";
                    fields[i].style.textAlign = "center";
                    is_loose(fields, mine_places);
                    alert("you loose this game");
                    remove_attribute(attribute, fields);
                    count = 0;
                    status = "started";
                    window.clearInterval(interval);
                    console.log("ssss", status, "count", count)

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
    let result;
    let open_fields = (rows * cols) - mines;
    if (opened_fields.length === open_fields) {
        result = 'true'
    } else {
        result = 'false'
    } return result;
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



function remove_attribute(attribute, fields) {
    console.log("remove:", attribute)
    for (i = 0; i < fields.length; i++) {
        fields[i].removeAttribute(attribute);
    }
}


