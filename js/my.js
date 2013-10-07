$(function(){
    var $datagrid = $('#dg');
    var $addFields = $('#addFields');
    var suppLocFields = {};

    load_data('/api/location/getSupportedFields').done(function(data) {
        suppLocFields = data;
        delete suppLocFields['id'];
    });

    $datagrid.edatagrid({
        url: '/api/location/getAllLocations',
        saveUrl: '/api/location/addLocation',
        updateUrl: '/api/location/editLocation',
        destroyUrl: '/api/location/deleteLocation'
    });

    $datagrid.datagrid({
        onSelect: function(rowIndex, rowData){
            $addFields.css('display', 'block');
            $addFields.html('');
            $.each(rowData, function(key, element) {
                if (key == 'id') {return true;}
                if (element == null) {return true;}
                $("<span style='display: inline-block' id=" + key + "Wrapper>").appendTo($addFields);
                $("<span style='margin-left: 3px'> " +  suppLocFields[key] + ' ' + "</span>").appendTo($('#'+key+'Wrapper'));

                $('<input/>', {
                    type: 'text',
                    size: element.length,
                    value: element,
                    class: 'autoSizeInput'
                }).appendTo($('#'+key+'Wrapper'));
                $('.autoSizeInput').autosizeInput();
            });
            $('<a/>', {
                plain: 'true',
                iconcls: 'icon-add',
                class: 'easyui-linkbutton l-btn l-btn-plain',
                id: 'add_field_btn'
            }).appendTo($addFields);

            $('<span/>', {
                class: 'l-btn-left',
                id: 'add_field_btn_wrap'
            }).appendTo($('#add_field_btn'));

            $('<span/>', {
                class: 'l-btn-text icon-add l-btn-icon-left',
                html: 'Add field'
            }).appendTo($('#add_field_btn_wrap'));
        },
        onLoadSuccess: function() {$addFields.css('display', 'none'); $datagrid.datagrid('unselectAll');}
    });
});

function doSearch(){
    $datagrid.datagrid('load',{
        name: $('#nameSearch').val(),
        city: $('#citySearch').val()
    });
}

function resetSearch() {
    $('#nameSearch').val('');
    $('#citySearch').val('');
    doSearch();
}

function load_data (json_url) {
    return $.getJSON(json_url);
}