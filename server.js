const { data } = require('jquery');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var url = require('url');
var fs = require('fs');
var multer = require('multer');
var router = express.Router();
var mutipart= require('connect-multiparty');
var mutipartMiddeware = mutipart();
var nodemailer = require('nodemailer');

app.use(require('express').static('src'));
app.use(mutipart({uploadDir:'./src/uploads'})); // 修改文件上传路径
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const chatroom_cilent = {
    groupName : "聊天室",
    groupId : 0,
    userList : []
};
var Group_Count = 1;
const user_cilents = [];
const group_cilents = [chatroom_cilent];

const upload_files = [];

// 重定向至index.html
app.get('/', function (req, res) {
    res.redirect('index.html');
});

// 监听特定端口
http.listen(3000, function () {
    console.log('listening on *:3000');
});

// 定义连接事件
io.on('connection', function (socket) {
    console.log(socket.id + ' connected');

    // 定义断开连接事件
    socket.on('disconnect', function () {
        console.log(socket.id + ' disconnected');
        let del_idx = user_cilents.findIndex(user => user.username == socket.username);
        if(del_idx == -1) return ;
        // console.log('del_idx : ' + del_idx);
        io.emit('Delete UserDiv', user_cilents[del_idx].username);
        user_cilents.splice(del_idx, 1);
        io.emit('Update UserList', user_cilents);
        // console.log(user_cilents);
    });

    // 用户注册/登录 
    socket.on('login', function (cilent) {
        Select_User(cilent, result => {
            if(result.length) {
                if(result[0].username != cilent.username) {
                    socket.emit('loginFail', '邮箱被注册！');
                    return ;                   
                }
                if(result[0].password != cilent.password) {
                    socket.emit('loginFail', '密码错误！');
                    return ;
                }
                if(user_cilents.findIndex(user => user.email == cilent.email) != -1) {
                    socket.emit('loginFail', '用户已登录！');
                    return ;
                }
            } else {
                Insert_User(cilent);
            }

            cilent.socket_id = socket.id;
            socket.username = cilent.username;
            user_cilents.push(cilent);
            // console.log(user_cilents);
            socket.emit('loginSuccess', user_cilents);
            io.emit('Update UserList', user_cilents);

            if(chatroom_cilent.userList.findIndex(user => user == cilent.username) == -1) chatroom_cilent.userList.push(cilent.username);
            socket.emit('Update GroupList', chatroom_cilent);
        });
    });

    // 用户忘记密码
    socket.on('Forget Password', function (data, callback) {
        var currentUsername;
        var currentPassword;
        Select_User(data, result => {
            if(!result.length) {
                callback('邮箱未注册！');
                return ;
            }
            currentUsername = result[0].username;
            currentPassword = result[0].password;
            console.log({
                email : data.email,
                username : currentUsername,
                password : currentPassword
            });
            SendEmail({
                email : data.email,
                username : currentUsername,
                password : currentPassword
            });
            callback('已发送一封包含账户和密码的邮件！');
        });
    });

    // 用户发送消息
    socket.on('Send Message', data => {
        // console.log("name : " + data.name);
        // console.log("toName : " + data.toName);
        // console.log("time : " + data.time);
        // console.log("msg : " + data.msg);
        if(data.msg == "") {
            socket.emit('Message Error', '输入为空');
            return ;
        }
        var nameId = user_cilents.find(user => user.username == data.name).socket_id;
        var toNameId = user_cilents.find(user => user.username == data.toName).socket_id;
        socket.emit('Show Message', data);
        io.to(toNameId).emit('Receive Message', data);
        
        // 上传消息至数据库
        Insert_Message({
            userFrom : data.name,
            userTo : data.toName,
            message : data.msg,
            time : data.time,
            isGroup : 0
        });
    });

    // 用户发送群组消息
    socket.on('Send Group Message', data => {
        // console.log("name : " + data.name);
        // console.log("toGroup : " + data.toGroup);
        // console.log("time : " + data.time);
        // console.log("msg : " + data.msg);
        var toUserList = group_cilents.find(group => group.groupName == data.toGroup).userList;
        // console.log("userList : " + toUserList);
        for(var i = 0; i < toUserList.length; i++) {
            if(toUserList[i] == data.name) continue;
            var toNameId = user_cilents.find(user => user.username == toUserList[i]).socket_id;
            io.to(toNameId).emit('Receive Message', data);
        }
        socket.emit('Show Message', data);   

        // 上传群聊消息至数据库
        Insert_Message({
            userFrom : data.name,
            userTo : data.toGroup,
            message : data.msg,
            time : data.time,
            isGroup : 1
        });
    });

    // 用户获取已上传文件
    socket.on('Get Files List', function (callback) {
        // console.log(upload_files);
        callback(upload_files);
    });

    // 后台增加上传文件
    socket.on('Add UploadFile', name => {
        upload_files.push(name);
        // console.log(upload_files);
    });

    // 用户创建新群组
    socket.on('Create Group', function (cilent) {
        if(cilent.groupName == "") {
            socket.emit('CreateGroup Fail', '群组名为空！');
            return ;
        }
        var idx = group_cilents.findIndex(group => group.groupName == cilent.groupName);
        if(idx != -1) {
            socket.emit('CreateGroup Fail', '群组名重复！');
            return ;
        } 
        cilent.groupId = Group_Count++;
        group_cilents.push(cilent);
        // console.log(group_cilents);
        socket.emit('CreateGroup Success', cilent);
        // console.log('groupName : ' + cilent.groupName);
        // console.log('groupId : ' + cilent.groupId);
        // console.log('groupList : ' + cilent.userList);
        for(var i = 0; i < cilent.userList.length; i++) {
            var name = cilent.userList[i];
            var nameId = user_cilents.find(user => user.username == name).socket_id;
            io.to(nameId).emit('Update GroupList', cilent);
        }
    });

    // 用户发送窗口抖动
    socket.on('Send Shake', data => {
        var toNameId = user_cilents.find(user => user.username == data.toName).socket_id;
        io.to(toNameId).emit('Receive Shake', data);      
    });

    // 用户同步历史记录
    socket.on('Get History', function (data, callback) {
        Select_Message(data, result => {
            // console.log(result);
            callback(result);
        });
    });
});

app.post('/upload', mutipartMiddeware, function (req, res) {
    // console.log(req.files);

    // 文件名替换
    var oldFile = req.files.fileInput.path;
    var newFile = './src/uploads/' + req.files.fileInput.originalFilename;
    // console.log('oldFile : ' + oldFile);
    // console.log('newFile : ' + newFile);
    fs.rename(oldFile, newFile, (err) => {
        // if(err) console.log('UPDATE ERROR');
        // else console.log('UPDATE SUCCESS');
    });

    res.send('upload success!');
});

// 数据库处理
var mysql = require('mysql');
const { group } = require('console');
const { del, route } = require('express/lib/application');
const { Router } = require('express');
var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'chat_orzjh_top'
});
connection.connect();
 
function Insert_User(data) {
    let sql = 'insert into user values (\'' + data.username + '\', \'' + data.password + '\', \'' + data.email + '\'); ';
    console.log(sql);
    
    connection.query(sql, (err, result) => {
        if(err) {
            console.log('[user insert error] - ', err.message);
            return ;
        } else {
            console.log('[user insert success]');
        }
    });
}

function Select_User(data, callback) {
    let sql = 'select * from user where email = \'' + data.email + '\'; ';
    // console.log(sql);
    
    connection.query(sql, (err, result) => {
        if(err) {
            console.log('[user select error] - ', err.message);
            callback(null);
        } else {
            console.log('[user select success]');
            callback(result);
        }
    }); 
}

function Insert_Message(data) {
    var msg = "";
    for(var i = 0; i < data.message.length; i++) {
        if(data.message[i] == '\'' || data.message[i] == '\"') msg += '\\';
        msg += data.message[i];
    }
    let sql = 'insert into message values (\'' + data.userFrom + '\', \'' + data.userTo + '\', \'' + msg + '\', \'' + data.time + '\', \'' + data.isGroup + '\'); ';
    console.log(sql);

    connection.query(sql, (err, result) => {
        if(err) {
            console.log('[message insert error] - ', err.message);
            return ;
        } else {
            console.log('[message insert success]');
        }
    });
}

function Select_Message(data, callback) {
    let sql;
    if(data.isGroup == 0) sql = 'select *, DATE_FORMAT(time, "%Y-%m-%d %h:%i:%s") as time from message where ( (userFrom = \'' + data.userFrom + '\' and userTo = \'' + data.userTo + '\') or (userFrom = \'' + data.userTo + '\' and userTo = \'' + data.userFrom + '\') ) and isGroup = ' + data.isGroup + '; ';
    else sql = 'select *, DATE_FORMAT(time, "%Y-%m-%d %h:%i:%s") as time from message where userTo = \'' + data.userTo + '\' and isGroup = ' + data.isGroup + '; ';
    console.log(sql);

    connection.query(sql, (err, result) => {
        if(err) {
            console.log('[message select error] - ', err.message);
            callback(null);
        } else {
            console.log('[message select success]');
            callback(result);
        }
    });
}

// 邮件处理
var transporter = nodemailer.createTransport({
    service : 'qq',
    port : 465, // SMTP端口
    secureConnection : true, // 使用SSL
    auth : {
        user : 'orzjh@qq.com',
        pass : 'wqwvqtqoxyhzdeac'    // SMTP授权码
    }
});

function SendEmail(data) {
    var mailOptions = {
        from : 'orzjh@qq.com',
        to : data.email,
        subject : '找回密码',
        text : 
            '您的用户名: ' + data.username + '\n' + 
            '您的密码: ' + data.password + '\n',
        html :
            '您的用户名: ' + data.username + '<br>' + 
            '您的密码: ' + data.password + '<br>'
    };
    console.log(mailOptions);

    transporter.sendMail(mailOptions, function(err, info) {
        if(err) return console.log(err);
        console.log('[Send Email Success]: ' + info.response);
    });
}