var createRoom = function(username, room) { // eslint-disable-line no-unused-vars
    var socket = io(); // eslint-disable-line no-undef
    socket.on(room + ':message', function(data) {
        var message = document.createElement('LI');
        message.className += 'list-item';
        message.style.border = '0px';
        message.innerHTML = '<div class="list-item-left">' +
            '<h3 style="display:inline-block;margin:0px;">' + data.username + '</h3>' +
            '<br><img src="/user/' + data.username + '/avatar" style="width:35px;height:35px;">' +
            '<br><small style="margin-left: 5px;display:inline-block;">' + data.date + '</small>' +
        '</div>' +
        '<div class="list-item-right">' +
            '<p>' + data.message + '</p>' +
        '</div>';
        document.getElementById('messages').appendChild(message);
    });
    socket.on('connect', function() {
        socket.emit(room + ':connection', {
            username: username
        });
    });
    socket.on(room + ':connection', function(data) {
        var message = document.createElement('LI');
        message.innerHTML= '<i style="display:block;margin-bottom:10px;" class="text-center text-default">' +
            data.username + ' has connected' +
        '</i>';
        document.getElementById('messages').appendChild(message);
    });
    document.querySelector('#chat').addEventListener('submit', function(e) {
        e.preventDefault();
        var chatInput = document.getElementById('message');
        socket.emit(room + ':message', {
            message: chatInput.value,
            username: username
        });
        chatInput.value = '';
        return false;
    });
};
