//various kinds of jss. not used for now

function initialize(from_json) {
    load_data(from_json).done(function(data) {
        data = extract_location(data);
        load_datagrid(data)
    } );
}

function load_data (json_url) {
    return $.getJSON(json_url);
}

function extract_location(data_array) {
    var temp = [];
    $.each(data_array, function(key, value) {temp.push(value.location)} );
    return temp;
}

function load_datagrid(data_array) {
    $('#dg').edatagrid('loadData', data_array);
}