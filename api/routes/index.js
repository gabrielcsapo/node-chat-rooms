var openBadge = require('openbadge');

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.send('error');
    });
    app.get('/:room.svg', function(req, res){
        var room = req.params.room;
        openBadge({
            text: ['chatter', room],
            color:{
                left:"#626262",
                right:"#0188b3",
                font:"#fff",
                shadow:"#fff"
            }
        }, function (err, badgeSvg) {
            res.set('Content-Type', 'image/svg+xml');
            res.send(badgeSvg);
        });
    });
    app.get('/:room', function(req, res){
        var room = req.params.room;
        res.render('room', {title: room, message: 'welcome!', room: room});
    });
}
