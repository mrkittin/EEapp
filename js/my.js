$(function(){
    $datagrid = $('#dg');
    $addLocInput = $('#addLocInput');
    $addFields = $('#addFields');
    suppLocFields = {};
    suppLocFields_values = [];

    load_data('/api/location/getSupportedFields').done(function(data) {
        suppLocFields = data;
        data.date_modified = 'Last Modified';
        $.each(suppLocFields, function(key, value) {
            suppLocFields_values.push(value);
        })
    });

    $datagrid.datagrid({
        url:'/api/location/getAllLocations'
    });

    $('#addBtn').on("click", function(){ addNew() });
    $('#searchBtn').on("click", function(){ doSearch() });
    $('#resetSearchBtn').on("click", function(){ resetSearch() });

    $datagrid.datagrid({
        onSelect: function(rowIndex, rowData){
            showDetailsFor(rowIndex, rowData);
            $addLocInput.css('display', 'none');
        },
        onLoadSuccess: function() {
            $addLocInput.css('display', 'none');
            $addFields.css('display', 'none');
            $datagrid.datagrid('unselectAll');
            $('.map_canvas').css('height', '358');
        }
    });
    $('.panel.datagrid').css('float', 'left').css('margin-bottom', '8px').css('margin-right', '8px');
    $('.panel-title').css('height', '8px').css('line-height', '8px');

    $addLocInput.autosizeInput();
    $addLocInput.geocomplete({
        map: ".map_canvas"
    });
    $addLocInput.css('height', '20px').css('border', '1px solid #ccc').css('margin-bottom', '8px').css('margin-left', '0px');
});

function addNew() {
    showDetailsFor(null, null);
    $addLocInput.css('display', 'inline-block');
    $datagrid.datagrid('unselectAll');
    $('#destroyBtnWrapper').css('display', 'none');
    $('.map_canvas').css('height', '326');
}

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

function getDisplayedInputs() {
    var res = [];
    $('.autoSizeInput[style!="display:none"]').each(function(index, element ) {
        res.push($(this).siblings($('span')).attr('name'));
    } );
    return res;
}

function addNewBlockThatMightBecomeAField() {
    //only fields that are not displayed currently could be added, so will be present in <select>
    //if we can't add more fields, 'Add field' button will not be displayed

    var addFieldsToDisplay = [];
    $.each(getFieldsToDisplay(), function(key, value){
        if (value != 'Last Modified') { addFieldsToDisplay.push(value); }
    });
    if (addFieldsToDisplay.length == 0) {return true;}

    $("<span style='display: inline-block' id='addFieldWrapper'>").appendTo($('#inputsSet'));
    var $addFieldWrapper = $('#addFieldWrapper');

    $('<a/>', {
        class: 'easyui-linkbutton l-btn l-btn-plain',
        id: 'add_field_btn',
        plain: 'true',
        iconcls: 'icon-add'
    }).appendTo($addFieldWrapper);

    $('<span/>', {
        class: 'l-btn-left',
        id: 'add_field_btn_wrap'
    }).appendTo($('#add_field_btn'));

    $('<span/>', {
        class: 'l-btn-text icon-add l-btn-icon-left',
        html: 'Add field'
    }).appendTo($('#add_field_btn_wrap'));

    $('#add_field_btn').on("click", function() {
        $(this).css('display', 'none');
        if (addFieldsToDisplay.length > 1) { $('#add_field_select').css('display', 'inline'); }
        else {
            var theOnlyFieldLower = addFieldsToDisplay[0].toLowerCase();
            $('#addFieldWrapper').attr('id', theOnlyFieldLower+'Wrapper');
            $("<span name='" + addFieldsToDisplay[0] + "' style='margin-left: 3px'> " +  addFieldsToDisplay[0]
                + ' ' + "</span>").prependTo($('#'+theOnlyFieldLower+'Wrapper'));
            $('#add_field_btn').remove();
            $('#add_field_select').remove();
            $('<input/>', {
                name: theOnlyFieldLower,
                type: 'text',
                class: 'autoSizeInput'
            }).appendTo($addFieldWrapper);
            $('.autoSizeInput').autosizeInput();
        }
    });

    $('<select/>', {
        id: 'add_field_select',
        style: 'display:none'
    }).appendTo($addFieldWrapper);
    $.each(addFieldsToDisplay, function(key, value) {
        if (value == 'Last Modified') {  return true; }
        $('#add_field_select').append($("<option></option>").attr("value",key).text(value));
    });
    $('#add_field_select').prepend($("<option></option>").attr("value",'nullValue').text('select field'));
    $('#add_field_select').on("change", function() {
        var selectedField = $('#add_field_select').find(':selected').text();
        $('#addFieldWrapper').attr('id', selectedField.toLowerCase()+'Wrapper');
        $("<span name='" + selectedField + "' style='margin-left: 3px'> " +  selectedField
            + ' ' + "</span>").prependTo($('#'+selectedField.toLowerCase()+'Wrapper'));
        $('#add_field_btn').remove();
        $('#add_field_select').remove();

        $('<input/>', {
            name: selectedField.toLowerCase(),
            type: 'text',
            class: 'autoSizeInput'
        }).appendTo($addFieldWrapper);
        $('.autoSizeInput').autosizeInput();

        if (getFieldsToDisplay().length > 0) {
            addNewBlockThatMightBecomeAField();
        }
    });
}

function showDetailsFor(rowIndex, rowData) {

    if (rowIndex == null && rowData == null) {
        addEmptyBlockWithFormForEditingOrAddingLocations('/api/location/addLocation');
        addWrapperWithSpanAndInputFor('id', '');
        addWrapperWithSpanAndInputFor('name', '');
        addWrapperWithSpanAndInputFor('lat', '');
        addWrapperWithSpanAndInputFor('lng', '');
    }
    else {
        addEmptyBlockWithFormForEditingOrAddingLocations('/api/location/editLocation');
        $.each(rowData, function(key, element) {
            if (element == null) {return true;}
            if (key == 'date_modified') {
                addWrapperWithSpanAndInputFor(key, element);
                $('input[name=date_modified]').prop('disabled', true);
                return true;
            }
            addWrapperWithSpanAndInputFor(key, element);
        });
    }
    $('#idWrapper').css('display', 'none');
    addNewBlockThatMightBecomeAField();
    addDestroyButton();
    addSaveButton();
    moveDateModified();
}

function moveDateModified() {
    $('#date_modifiedWrapper').appendTo($('#statusesSet'));
}

function addWrapperWithSpanAndInputFor(name, withValue) {
    $("<span style='display: inline-block' id=" + name + "Wrapper>").appendTo($('#inputsSet'));

    $("<span name='" + suppLocFields[name] + "' style='margin-left: 3px'> " +  suppLocFields[name] + ' '
        + "</span>").appendTo($('#'+name+'Wrapper'));

    var final_value = name == 'date_modified' ? new Date(withValue).toLocaleString() : withValue;

    $('<input/>', {
        name: name,
        type: 'text',
        value: final_value,
        class: 'autoSizeInput'
    }).appendTo($('#'+name+'Wrapper'));
    $('.autoSizeInput').autosizeInput();
}

function addEmptyBlockWithFormForEditingOrAddingLocations(url) {
    $addFields.css('display', 'block');
    $addFields.css('clear', 'both');
    $addFields.html('');

    $('<form/>', {
        id:'addFields_form',
        method:'post'
    }).appendTo($addFields);
    $addFields_form = $('#addFields_form');

    $addFields_form.form({
        url: url,
        onSubmit: function(){
            // do some check
            // return false to prevent submit;
        },
        success:function(data){
            $datagrid.datagrid('reload');
        }
    });

    createFieldset('inputsSet', 'Editables', 'block', 'top');
    createFieldset('statusesSet', 'Statuses', 'inline', 'bottom');
    $('#statusesSet').append('<input id="dummy01" style="height: 26px; width: 1px; border: 0px; padding: 0px; visibility: hidden;">');
    createFieldset('actionsSet', 'Actions', 'inline', 'bottom');
}

function createFieldset(id, legend, display, verticalAlign) {
    $('<fieldset/>', {
        id: id,
        style: 'margin-top:3px; margin-bottom:3px; border: 1px dotted #cccccc; display: ' + display + '; vertical-align: ' + verticalAlign
    }).appendTo($addFields_form);
    $("<legend style='color: #ccc'>" + legend + "</legend>").appendTo($('#'+id));
}

function addDestroyButton() {
    $("<span style='display: inline-block; float:left' id='destroyBtnWrapper'>").appendTo($('#actionsSet'));

    $('<a/>', {
        class: 'easyui-linkbutton l-btn l-btn-plain',
        id: 'destroy_btn',
        plain: 'true',
        iconcls: 'icon-remove'
    }).appendTo($('#destroyBtnWrapper'));

    $('<span/>', {
        class: 'l-btn-left',
        id: 'destroy_btn_wrap'
    }).appendTo($('#destroy_btn'));

    $('<span/>', {
        class: 'l-btn-text icon-remove l-btn-icon-left',
        html: 'Destroy'
    }).appendTo($('#destroy_btn_wrap'));

    $('#destroy_btn').on("click", function() { destroySelected() });
}

function addSaveButton() {
    $("<span style='display: inline-block; float:left' id='saveBtnWrapper'>").appendTo($('#actionsSet'));

    $('<a/>', {
        class: 'easyui-linkbutton l-btn l-btn-plain',
        id: 'save_btn',
        plain: 'true',
        iconcls: 'icon-save'
    }).appendTo($('#saveBtnWrapper'));

    $('<span/>', {
        class: 'l-btn-left',
        id: 'save_btn_wrap'
    }).appendTo($('#save_btn'));

    $('<span/>', {
        class: 'l-btn-text icon-save l-btn-icon-left',
        html: 'Save'
    }).appendTo($('#save_btn_wrap'));

    $('#save_btn').on("click", function() { $('#addFields_form').submit() });
}

function destroySelected() {
    var row = $datagrid.datagrid('getSelected');
    if (row){
        $.messager.confirm('Confirm','Are you sure you want to destroy this location?',function(r){
            if (r){
                $.post('/api/location/deleteLocation',{id:row.id},function(result){
                    if (result.success){
                        $datagrid.datagrid('reload');
                    } else {
                        $.messager.show({    // show error message
                            title: 'Error',
                            msg: result.errorMsg
                        });
                    }
                },'json');
            }
        });
    }
}

function getFieldsToDisplay() {
    return $(suppLocFields_values).not(getDisplayedInputs());
}
