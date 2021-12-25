// 调整图片大小
function ResizePic() {
    var message_input = document.getElementById('message-input');
    for(var i = 0; i < message_input.childNodes.length; i++) {
        var obj = message_input.childNodes[i];
        // console.log(obj.id);
        if(obj.id == "uploadPic") {
            var MaxWidth = 100;
            var width = $(obj).width;
            var height = $(obj).height;
            var ratio = MaxWidth / width;
            $(obj).css('width', MaxWidth);
            $(obj).css('height', height * ratio);
        } else if(obj.id == "uploadScreen") {
            var MaxWidth = 200;
            var width = $(obj).width;
            var height = $(obj).height;
            var ratio = MaxWidth / width;
            $(obj).css('width', MaxWidth);
            $(obj).css('height', height * ratio);
        }
    }
}

/* 
    上传图片并显示预览
    不能上传大小大于100KB的图片
*/
function UploadPic() {
    var upload_file = document.getElementById('filePic').files[0];
    var fr = new window.FileReader();
    var MAXSIZE = 100 * 1024;
    fr.readAsDataURL(upload_file);
    if(upload_file.size > MAXSIZE) {
        alert('上传的图片超过100KB！');
        return false;
    }
    // console.log(upload_file);
    fr.addEventListener('load', function () {
        document.getElementById('message-input').innerHTML += '<img src=\"'+ fr.result +'\" id="uploadPic" class="uploadPic">';
        ResizePic();
        document.getElementById('filePic').value = "";
    });
    return false;
}

// 实现截图功能并下载
function PrintScreen() {
    new html2canvas(document.getElementById('chatroom-main-bg')).then(canvas => {
        // let currentImg = new Image();
        // currentImg.src = canvas.toDataURL();
        // document.getElementById('message-input').innerHTML += '<img src=\"'+ currentImg.src +'\" id="uploadScreen" class="uploadScreen">';
        // ResizePic();
        
        canvas.toBlob( function (blob) { saveAs(blob, 'printScreen.png'); } );
    });
}

// 上传完文件后直接提交表单
function UploadFile() {
    var upload_file = document.getElementById('fileInput').files[0];
    // console.log('file name : ' + upload_file.name);

    if(upload_file.name == "") return ;
    socket.emit('Get Files List', function (result) {
        var upload_files = result; 
        // console.log(upload_files);

        var flag = upload_files.findIndex(file => file == upload_file.name);
        if(flag == -1) {
            $('#fileForm').submit( function () {
                socket.emit('Add UploadFile', upload_file.name);
                var link = './uploads/' + upload_file.name;
                document.getElementById('message-input').innerHTML += '<a href="' + link + '">' + upload_file.name + '</a>';
                console.log(document.getElementById('message-input').innerHTML);
            } );
        } else {
            alert('上传文件名和已上传文件名重复！');
        }
        document.getElementById('fileInput').value = "";
    });
}