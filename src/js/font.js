function ModifyFontDivMenu() {
    $('#modifyFont-div').fadeIn();
}

function ModifyFontDivSubmit() {
    $('#message-input').css('font-size', $('#fontSize option:selected').text() + 'px');
    $('#message-input').css('font-family', $('#fontFamily option:selected').text());
    ModifyFontDivClose();
    return false;
}

function ModifyFontDivClose() {
    $('#modifyFont-div').hide();
    return false;
}