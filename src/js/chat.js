// 界面隐藏/显现
function MessagesHide(user) {
    if(chatType == 'USER') {
        $('#messages-' + user).hide();
        $('#option-' + user).css('background-color', 'white');
    } else {
        $('#messages-group-' + user).hide();
        $('#option-group-' + user).css('background-color', 'white');
    }
}
function MessagesFadeIn(user) {
    if(chatType == 'USER') {
        $('#messages-' + user).fadeIn();
        $('#option-' + user).css('background-color', 'rgb(206, 206, 206)');
        $('#option-' + user).children("div").attr('class', 'redDotHide');
    } else {
        $('#messages-group-' + user).fadeIn();
        $('#option-group-' + user).css('background-color', 'rgb(206, 206, 206)');
        $('#option-group-' + user).children("div").attr('class', 'redDotHide');
    }
} 

// 用户/群组被选中
function Selected(user) {
    chatType = 'USER';
    if(selected_idx != -1) MessagesHide(_messages[selected_idx]);
    selected_idx = _messages.findIndex(name => name == user);
    group_selected_idx = -1;
    // console.log(selected_idx);
    document.getElementById('header-h1').innerHTML = user;
    MessagesFadeIn(user);
}
function GroupSelected(group) {
    chatType = 'GROUP';
    if(group_selected_idx != -1) MessagesHide(_group_messages[group_selected_idx]);
    group_selected_idx = _group_messages.findIndex(name => name == group);
    selected_idx = -1;
    // console.log(group_selected_idx);
    document.getElementById('header-h1').innerHTML = group + '(群组)';
    MessagesFadeIn(group);
}
// 好友/群组列表转换
function ChangeToUser() {
    $('#group-list').hide();
    $('#user-list').fadeIn();
    var group_list = document.getElementById('group-list');
    if(group_selected_idx != -1) MessagesHide(_group_messages[group_selected_idx]);
    group_selected_idx = -1;
    chatType = 'USER';
    return false;
}
function ChangeToGroup() {
    $('#user-list').hide();
    $('#group-list').fadeIn();
    var user_list = document.getElementById('user-list');
    if(selected_idx != -1) MessagesHide(_messages[selected_idx]);
    selected_idx = -1;
    chatType = 'GROUP';
    return false;
}

// 显示群组菜单
function CreateGroupMenu() {
    $('#createGroup-div').fadeIn();
    var user_list = document.getElementById('user-list');
    var createGroup_userList = document.getElementById('createGroup-userList');
    for(var i = 0; i < _messages.length; i++) {
        var name = _messages[i];
        console.log(name);
        if(name == _username.value) continue;
        createGroup_userList.innerHTML += '<input type="checkbox" value="' + name +  '">' + name + '<br>'
    }
    return false;
}

// 创建新群组
function CreateGroupDivSubmit() {
    var selected_userList = [];
    selected_userList.push(_username.value);
    var createGroup_groupName = document.getElementById('createGroup-groupName');
    var createGroup_userList = document.getElementById('createGroup-userList');
    // console.log(createGroup_groupName.innerHTML);
    // console.log(createGroup_userList.innerHTML);
    // console.log(createGroup_userList.childNodes);
    for(var i = 0; i < createGroup_userList.childNodes.length; i++) {
        var obj = createGroup_userList.childNodes[i];
        if(obj.tagName != 'INPUT') continue;
        if(obj.checked) selected_userList.push(obj.value);
    }
    // console.log(selected_userList);

    var _data = {
        groupName : createGroup_groupName.innerHTML,
        userList : selected_userList
    };

    socket.emit('Create Group', _data);

    socket.on('CreateGroup Fail', msg => {
        alert(msg);
    }); 
    
    socket.on('CreateGroup Success', group_cilent => {
        CreateGroupDivClose();
    });

    return false;
}

// 关闭群组菜单
function CreateGroupDivClose() {
    var createGroup_userList = document.getElementById('createGroup-userList');
    var createGroup_groupName = document.getElementById('createGroup-groupName');
    createGroup_userList.innerHTML = "";
    createGroup_groupName.innerHTML = "";
    $('#createGroup-div').hide();
    return false;
}

// 更新用户列表
socket.on('Update UserList', function (userlist) {
    // console.log(userlist);
    var len = userlist.length;
    var cur = "";
    _messages.length = 0;
    for(var i = 0; i < len; i++) {
        cur += '<li onclick=\'Selected("' + userlist[i].username + '");\' class="list-option list-group-item" value="' + userlist[i].username + '" id="option-' + userlist[i].username + '">' + 
            '<p class="user-list-class">' + userlist[i].username + '</p>' + 
            '<div id="redDot" class="redDotHide">' + '</div>'
        + '</li>';
        let idx = _messages.findIndex(name => name == userlist[i].username);
        if(idx == -1) {
            $('#messages-content').append( '<ul id="messages-' + userlist[i].username + '" class="messages" style="display : none;">' + '</ul>' );
            MessagesHide(userlist[i].username);
            _messages.push( userlist[i].username );
        }
    }
    // console.log(_messages);
    document.getElementById('user-list').innerHTML = cur;
});

// 更新群组列表
socket.on('Update GroupList', function (cilent) {
    $('#group-list').append('<li onclick=\'GroupSelected("' + cilent.groupName + '");\' class="list-option list-group-item" value="' + cilent.groupName +  '" id="option-group-' + cilent.groupName + '">' + 
        '<p class="user-list-class">' + cilent.groupName + '</p>' + 
        '<div id="redDot" class="redDotHide">' + '</div>'
    + '</li>');
    $('#messages-content').append( '<ul id="messages-group-' + cilent.groupName + '" class="messages" style="display : none;">' + '</ul>' );
    _group_messages.push(cilent.groupName);
});

// 删除特定用户的信息块
socket.on('Delete UserDiv', del_username => {
    // console.log('messages-' + del_username);
    var del_idx = _messages.findIndex(username => username == del_username);
    if(del_idx == -1) return ;
    if(del_idx == selected_idx) selected_idx = 0;
    _messages.splice(del_idx, 1);
    let del_div = document.getElementById('messages-' + del_username);
    del_div.parentNode.removeChild(del_div);
});