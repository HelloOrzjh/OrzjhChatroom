// Date原型添加format方法
Date.prototype.format = function (fmt) { 
    var o = { 
        "M+" : this.getMonth()+1,                 //月份 
        "d+" : this.getDate(),                    //日 
        "h+" : this.getHours(),                   //小时 
        "m+" : this.getMinutes(),                 //分 
        "s+" : this.getSeconds(),                 //秒 
    }; 

    if(/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    }

    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : ( ("00"+ o[k]).substr((""+ o[k]).length) ) );
        }
    }
    return fmt; 
}

// 用户发送信息
function SendMessage() {
    var _time = new Date().format("yyyy-MM-dd hh:mm:ss");
    var message_input = document.getElementById('message-input');
    var _msg = 
        '<p style="font-family : \'' + $('#fontFamily option:selected').text() + 
        '\'; font-size : ' + $('#fontSize option:selected').text() + 'px' + ';">' + 
        message_input.innerHTML
        + '</p>';
    // console.log(_msg);

    if(chatType == 'USER') {
        var user_list = document.getElementById('user-list'); 
        var idx = selected_idx;
        if(idx == -1) return false;
        var _toName = _messages[idx];
        var _data = {
            name : _username.value,
            toName : _toName,
            time : _time,
            msg : _msg,
            type : chatType,
        };
        socket.emit('Send Message', _data);
    } else {
        var group_list = document.getElementById('group-list'); 
        var idx = group_selected_idx;
        if(idx == -1) return false;
        var _toGroup = _group_messages[idx];
        var _data = {
            name : _username.value,
            toGroup : _toGroup,
            time : _time,
            msg : _msg,
            type : chatType,
        };
        socket.emit('Send Group Message', _data);
    }
    message_input.innerHTML = "";
    return false;
}

// 修改消息显示样式
function ShowMessageStyle(data) {
    var msg = '<p>' + 
        '<p style="color : green; line-height : 1px; font-weight : bold">' + data.name + ' ' + data.time + '</p>' +
        '<p>' + data.msg + '</p>' +
    '</p>';
    return '<li>' + msg + '</li>';
}
function ReceiveMessageStyle(data) {
    var msg = '<p>' + 
        '<p style="color : blue; line-height : 1px; font-weight : bold">' + data.name + ' ' + data.time + '</p>' +
        '<p>' + data.msg + '</p>' +
    '</p>';
    return '<li>' + msg + '</li>';
}

/*
    用户接收消息
    有未读消息在右侧显示红点
*/
socket.on('Receive Message', data => {
    if(data.name == data.toName) return ;
    var toDivId, toOption;
    var redDot = document.createElement('div');
    redDot.id = 'redDot';
    redDot.className = 'redDot';
    redDot.innerHTML = 'QAQ';
    if(data.type == 'USER') {
        toDivId = 'messages-' + data.name;
        toOption = '#option-' + data.name;
        let idx = _messages.findIndex(name => name == data.name);
        console.log(chatType + " " + idx);
        if( ! ( chatType == 'USER' && idx == selected_idx ) ) {
            $(toOption).children("div").attr('class', 'redDotFadeIn');
        }
    } else {
        toDivId = 'messages-group-' + data.toGroup;
        toOption = '#option-group-' + data.toGroup;
        let idx = _group_messages.findIndex(name => name == data.toGroup);
        console.log(chatType + " " + idx);
        if( ! ( chatType == 'GROUP' && idx == group_selected_idx ) ) {
            $(toOption).children("div").attr('class', 'redDotFadeIn');
        }
    }
    $('#' + toDivId).append( ReceiveMessageStyle(data) );
});

// 用户发送的消息显示在聊天框中
socket.on('Show Message', data => {
    var toDivId;
    if(data.type == 'USER') toDivId = 'messages-' + data.toName;
    else toDivId = 'messages-group-' + data.toGroup;
    $('#' + toDivId).append( ShowMessageStyle(data) );
});

socket.on('Message Error', msg => {
    alert(msg);
});