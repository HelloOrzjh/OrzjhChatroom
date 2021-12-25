// 窗口抖动
function Shake(callback) {
    let ui = document.getElementById('chatroom-main-ui');
    ui.classList.add('shake');
    setTimeout(() => { ui.classList.remove('shake') }, 800);
    callback();
}

// 发送窗口抖动
function SendShake() {
    if(chatType == 'USER') {
        var user_list = document.getElementById('user-list');
        if(selected_idx == -1) return false;
        var _data = {
            name : _username.value,
            toName : _messages[selected_idx]
        }
        socket.emit('Send Shake', _data);
    }
    return false;
}

// 用户接收到窗口抖动消息
socket.on('Receive Shake', data => {
    Shake( function () {
        alert(data.name + '向你发送了一个窗口抖动！');
    });
});