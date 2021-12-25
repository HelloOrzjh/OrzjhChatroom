function SynchronousHistory() {
    var _userTo;
    var user_list = document.getElementById('user-list');
    var group_list = document.getElementById('group-list');
    if(chatType == 'USER') {
        if(selected_idx == -1) return false;
        _userTo = _messages[selected_idx];
    } else {
        if(group_selected_idx == -1) return false;
        _userTo = _group_messages[group_selected_idx];
    }
    var _data = {
        userFrom : _username.value,
        userTo : _userTo,
        isGroup : chatType == 'GROUP'
    };

    socket.emit('Get History', _data, (result) => {
        // console.log('result length : ' + result.length);
        console.log(result);
        var msgData;
        var toDivId;
        if(chatType == 'USER') {
            toDivId = 'messages-' + _userTo;
            document.getElementById(toDivId).innerHTML = "";
            for(var i = 0; i < result.length; i++) {
                msgData = {
                    name : result[i].userFrom,
                    time : result[i].time,
                    msg : result[i].message,
                }
                if(result[i].userFrom == _username.value) {
                    $('#' + toDivId).append( ShowMessageStyle(msgData) );
                } else {
                    $('#' + toDivId).append( ReceiveMessageStyle(msgData) );  
                }
            }
        } else {
            toDivId = 'messages-group-' + _userTo;
            document.getElementById(toDivId).innerHTML = "";
            for(var i = 0; i < result.length; i++) {
                msgData = {
                    name : result[i].userFrom,
                    time : result[i].time,
                    msg : result[i].message,
                }
                if(result[i].userFrom == _username.value) {
                    $('#' + toDivId).append( ShowMessageStyle(msgData) );
                } else {
                    $('#' + toDivId).append( ReceiveMessageStyle(msgData) );
                }
            }
        }
    });
    return false;
}