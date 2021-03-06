$(function(){
    createHiddenInputs();

    $datagrid = $('#dg');
    $addLocInput = $('#addLocInput');
    $addFields = $('#addFields');
    suppLocFields = {};
    suppLocFields_keys = [];
    suppLocFields_values = [];
    gmap = {};
    additionalInputs = ['formatted_address', 'website', 'international_phone_number', 'zoom'];

    load_data('/api/location/getSupportedFields').done(function(data) {
        suppLocFields = data;
        data.date_modified = 'Last Modified';
        $.each(suppLocFields, function(key, value) {
            suppLocFields_keys.push(key);
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
            $('.map_canvas').css('height', '358');
            moveOrHideAddFieldButton();
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

    $addLocInput.geocomplete({
        map: ".map_canvas",
        markerOptions: {
            draggable: true
        },
        details: "#hiddenForm"
    }).on("geocode:result", function(event, result){
            copyFromHiddenInput('lat', 'lat');
            copyFromHiddenInput('lng', 'lng');
            copyFromHiddenInput('city', 'locality');
            copyFromHiddenInput('country', 'country');
            saveZoomToHiddenForm();
            createAdditionalInputsIfTheyAbsentAndThereIsSmthToCopy();
            copyFromAdditionalInputs();
            detachEmptyAdditionalInputs();
            $("#addFields_form input[name='zoom']").parent().hide();
            if ($('#addFieldWrapper').length == 0 && getFieldsToDisplayWithoutStatuses().length > 0) {
                addNewBlockThatMightBecomeAField();
            }
        })
      .on("geocode:dragged", function(event, latLng){
        $("#addFields_form input[name='lat']").val(latLng.lat());
        $("#addFields_form input[name='lng']").val(latLng.lng());
        $("#addFields_form input[name='zoom']").val(testmap.getZoom());
    });
//    var gmap_container = document.getElementsByClassName("map_canvas")[0];
//    var myOptions = {
//        zoom: 10,
//        //center: new google.maps.LatLng(0, 0),
//        scrollwheel: false,
//        mapTypeId: google.maps.MapTypeId.ROADMAP
//    };
    //gmap = new google.maps.Map(gmap_container, myOptions);
    $addLocInput.css('height', '20px').css('border', '1px solid #ccc').css('margin-bottom', '8px').css('margin-left', '0px');
});

function showOnMap(lat, lng) {
    var latlng = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
    var zoomStr = $("#addFields_form input[name='zoom']").val();
    var zoomStr_intValue = parseInt(zoomStr);
    if (zoomStr_intValue > 0) {
        testmap.setZoom(parseInt(zoomStr));
    }
    testmap.setCenter(latlng);

    testmarker.setPosition(latlng);
}

function saveZoomToHiddenForm() {
    var zoom = testmap.getZoom();
    $('#hiddenForm input[name="zoom"]').val(zoom);
}

function createHiddenInputs() {
    var inputs = ['street_address', 'route', 'intersection', 'political', 'country', 'administrative_area_level_1',
        'administrative_area_level_2', 'administrative_area_level_3', 'colloquial_area', 'locality', 'sublocality',
        'neighborhood', 'premise', 'subpremise', 'postal_code', 'natural_feature', 'airport', 'park', 'point_of_interest',
        'post_box', 'street_number', 'floor', 'room', 'lat', 'lng', 'viewport', 'location', 'formatted_address',
        'location_type', 'bounds', 'id', 'url', 'website', 'vicinity', 'reference', 'rating', 'international_phone_number',
        'icon', 'formatted_phone_number', 'zoom'];
    $('<form style="display: none;" id="hiddenForm"/>').prependTo($('body'));
    $.each(inputs, function(index, value) {
        $('<label>'+value+'</label>').appendTo($('#hiddenForm'));
        $('<input name="' + value + '" type="text" value="">').appendTo($('#hiddenForm'));
    });
}

function copyFromHiddenInput(ourName, theirName) {
    $('#addFields_form input[name="' + ourName + '"]').val($('#hiddenForm input[name="' + theirName + '"]').val());
    $('#addFields_form input[name="' + ourName + '"]').change();
}

function createAdditionalInputsIfTheyAbsentAndThereIsSmthToCopy() {
    $.each(getFieldsToDisplayWithoutStatuses(), function (key, value) {
        if ($(".autoSizeInput[name='" + value + "']").length == 0
            && $('#hiddenForm input[name="' + value + '"]').length > 0
            && $('#hiddenForm input[name="' + value + '"]').val().length > 0) {
            addWrapperWithSpanAndInputFor(value, '');
        }
        moveOrHideAddFieldButton();
    });
}

function moveOrHideAddFieldButton() {
    var addFieldsToDisplay = getFieldsToDisplayWithoutStatuses();
    if (addFieldsToDisplay.length == 0) {
        $('#addFieldWrapper').css('display', 'none');
    }
    if (addFieldsToDisplay.length > 0) {
        $('#addFieldWrapper').css('display', 'inline-block');
        $('#addFieldWrapper').appendTo($('#inputsSet'))
    }
}

function detachEmptyAdditionalInputs() {
    $.each(additionalInputs, function(key, value) {
        var input = $('#addFields_form input[name="' + value + '"]');
        if (input.length > 0) {
            if ( $(input).val().length == 0 ) { $(input).parent().detach(); }
        }
    });
    moveOrHideAddFieldButton();
}

function copyFromAdditionalInputs() {
    $.each(additionalInputs, function(key, value) {
        copyFromHiddenInput(value, value);
    });
}

function addNew() {
    showDetailsFor(null, null);
    $addLocInput.css('display', 'inline-block');
    $addLocInput.val('');
    $datagrid.datagrid('unselectAll');
    $('#destroyBtnWrapper').css('display', 'none');
    $('.map_canvas').css('height', '326');
}

function doSearch(){
    $datagrid.datagrid('load',{
        name: $('#nameSearch').val(),
        city: $('#citySearch').val(),
        country: $('#countrySearch').val()
    });
}

function resetSearch() {
    $('#nameSearch').val('');
    $('#citySearch').val('');
    $('#countrySearch').val('');
    doSearch();
}

function load_data (json_url) {
    return $.getJSON(json_url);
}

function getDisplayedInputsValues() {
    var res = [];
    $('.autoSizeInput[style!="display:none"]').each(function(index, element ) {
        res.push($(this).siblings($('span')).attr('name'));
    } );
    return res;
}

function getDisplayedInputsNames() {
    var res = [];
    $('.autoSizeInput').parent().each(function(index, element ) {
        if ($(element).css('display') != 'none') { res.push($(element).children('input').attr('name')); }
    } );

    $('textarea').parent().each(function(index, element ) {
        if ($(element).css('display') != 'none') { res.push($(element).children('textarea').attr('name')); }
    } );

    return res;
}

function getFieldsToDisplayWithoutStatuses() {
    var addFieldsToDisplay = [];
    $.each(getFieldsToDisplay(), function(key, value){
        if (value != 'date_modified') { addFieldsToDisplay.push(value); }
    });
    return addFieldsToDisplay;
}

function addNewBlockThatMightBecomeAField() {
    //only fields that are not displayed currently could be added, so will be present in <select>
    //if we can't add more fields, 'Add field' button will not be displayed

    var addFieldsToDisplay = getFieldsToDisplayWithoutStatuses();
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
        addFieldsToDisplay = getFieldsToDisplayWithoutStatuses();
        var indexOfZoom = addFieldsToDisplay.indexOf('zoom');
        if (indexOfZoom > -1) {
            addFieldsToDisplay.splice(indexOfZoom, 1);
        }
        if (addFieldsToDisplay.length == 0) {return true;}
        if (addFieldsToDisplay.length > 1) {
            $('#add_field_select').css('display', 'inline');
            $.each(addFieldsToDisplay, function(key, value) {
                $('#add_field_select').append($("<option></option>").attr("value",value).text(suppLocFields[value]));
            });
        }
        else {
            var theOnlyFieldLower = addFieldsToDisplay[0];
            $('#addFieldWrapper').attr('id', theOnlyFieldLower+'Wrapper');
            $("<span name='" + addFieldsToDisplay[0] + "' style='margin-left: 3px'> " + suppLocFields[addFieldsToDisplay[0]]
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

    $('#add_field_select').prepend($("<option></option>").attr("value",'nullValue').text('select field'));
    $('#add_field_select').on("change", function() {
        var selectedField = $('#add_field_select').find(':selected').val();
        $('#addFieldWrapper').attr('id', selectedField+'Wrapper');
        $("<span name='" + selectedField + "' style='margin-left: 3px'> " +  suppLocFields[selectedField]
            + ' ' + "</span>").prependTo($('#'+selectedField+'Wrapper'));
        $('#add_field_btn').remove();
        $('#add_field_select').remove();

        $('<input/>', {
            name: selectedField,
            type: 'text',
            class: 'autoSizeInput'
        }).appendTo($addFieldWrapper);
        $('.autoSizeInput').autosizeInput();

        if (getFieldsToDisplayWithoutStatuses().length > 0) {
            addNewBlockThatMightBecomeAField();
        }
    });
}

function showDetailsFor(rowIndex, rowData) {

    var description = "";

    if (rowIndex == null && rowData == null) {
        addEmptyBlockWithFormForEditingOrAddingLocations('/api/location/addLocation');
        addWrapperWithSpanAndInputFor('id', '');
        addWrapperWithSpanAndInputFor('zoom', '');
        addWrapperWithSpanAndInputFor('name', '');
        addWrapperWithSpanAndInputFor('lat', '');
        addWrapperWithSpanAndInputFor('lng', '');
        addWrapperWithSpanAndInputFor('city', '');
        addWrapperWithSpanAndInputFor('country', '');
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
            if (key == 'description') {description = element; }
            else {
                addWrapperWithSpanAndInputFor(key, element);
            }
        });
    }
    $('#idWrapper').hide();
    if (getFieldsToDisplayWithoutStatuses().length > 0) { addNewBlockThatMightBecomeAField(); }
    $("#addFields_form input[name='zoom']").parent().hide();
    addDescriptionArea(description);
    addDestroyButton();
    addSaveButton();
    moveDateModified();
    updateMapFromForm();
}

function addDescriptionArea(description) {
    $("<span style='display: inline-block' id='descriptionWrapper'>").appendTo($('#inputsSet'));
    var $descriptionWrapper = $('#descriptionWrapper');

    $("<span name='description' style='margin-left: 3px'> " +  suppLocFields['description'] + ' '
        + "</span>").appendTo($descriptionWrapper);

    $('<textarea/>', {
        name: 'description'
    }).appendTo($descriptionWrapper);
    $('textarea').css('vertical-align', 'middle');
    $('textarea').html(description);
    $('textarea').elastic();
}

function updateMapFromForm() {
    var lat = $('#addFields_form input[name=lat]').val();
    var lng = $('#addFields_form input[name=lng]').val();
    if (lat.length > 0 && lng.length > 0) {
        showOnMap(lat, lng);
    }
}

function moveDateModified() {
    $('#date_modifiedWrapper').appendTo($('#statusesSet'));
}

function addWrapperWithSpanAndInputFor(name, withValue) {
    $("<span style='display: inline-block' id=" + name + "Wrapper>").appendTo($('#inputsSet'));

    $("<span name='" + name + "' style='margin-left: 3px'> " +  suppLocFields[name] + ' '
        + "</span>").appendTo($('#'+name+'Wrapper'));

    var final_value = name == 'date_modified' ? new Date(withValue).toLocaleString() : withValue;

    $('<input/>', {
        name: name,
        type: 'text',
        value: final_value,
        class: 'autoSizeInput'
    }).appendTo($('#'+name+'Wrapper'));
    $('.autoSizeInput').autosizeInput();
    $('#addFields_form input[name="' + name + '"]').change();
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
    var obj = $(suppLocFields_keys).not(getDisplayedInputsNames());
    var res = [];
    $.each(obj, function(key, value) {
        if (value != 'id' && value != 'zoom') res.push(value);
    });

    return res;
}


