module.exports = function(app) {
    app.get('/', function(req, res) {
        // error
        res.send('error');
    });

    app.get('/:room', function(req, res){
        var room = req.params.room;
        res.render('room', {title: room, message: 'welcome!', room: room});
    });
}
