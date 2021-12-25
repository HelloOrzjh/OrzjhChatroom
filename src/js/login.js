// 用户登录时执行操作
function login() {
    _email = document.getElementById('email');
    _username = document.getElementById('username');
    _password = document.getElementById('password');

    // 邮箱格式进行正则匹配
    var matchingString = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
    // console.log(_email.value);
    // console.log(matchingString.test(_email.value));

    if(_email.value == '') {
        alert('请输入邮箱！');
        return ;
    } else if(!matchingString.test(_email.value)) {
        alert('邮箱格式不合法！');
        return ;
    }
    if(_username.value == '') {
        alert('请输入用户名！');
        return ;
    }
    if(_password.value == '') {
        alert('请输入密码！');
        return ;
    }

    _cilent.email = _email.value;
    _cilent.username = _username.value;
    _cilent.password = _password.value;
    
    socket.emit('login', _cilent);

    // 登录失败
    socket.on('loginFail', msg => { 
        alert(msg); 
    });

    // 登录成功
    socket.on('loginSuccess', cilents => {
        $('#login-main-bg').hide();
        $('#chatroom-main-bg').fadeIn();
        $('title').html(_username.value);
        $("#message-input").emoji(options);
    });
}

// 用户忘记密码
function forgetPwd() {
    _email = document.getElementById('email');
    if(_email.value == '') {
        alert('请输入邮箱！');
        return ;
    }
    var _data = {
        email : _email.value
    }
    socket.emit('Forget Password', _data, (msg) => { alert(msg); });
}