var socket = io();

var _username;
var _password;
var _cilent = {};
var _toName;
const _messages = [];
const _group_messages = ["聊天室"];
var selected_idx = -1;
var group_selected_idx = -1;
var chatType = 'GROUP';