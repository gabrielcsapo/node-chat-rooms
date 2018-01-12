var assert = require('chai').assert;
var request = require('supertest');
var chance = require('chance')();
var fs = require('fs');

describe('chatter', function() {
    process.env.MONGO_URL = 'mongodb://localhost:27017/chatter';

    var app = require('../index.js');

    after(function() {
        app.close(function(){
            process.exit();
        });
    });

    describe('pages', function() {

        it('should give a status of 200 on /', function(done) {
            request(app)
                .get('/')
                .expect(200)
                .end(function(err) {
                    if (err) throw err;
                    done();
                });
        });

    });

    var now = Date.now();
    var object = {
        username: now,
        email: chance.email({
            domain: 'example.com'
        }),
        password: 'testing123'
    };

    describe('register', function() {

        it('should get back a 302 response for register', function(done) {
            request(app)
                .post('/register')
                .send(object)
                .expect(302)
                .end(function(err) {
                    if (err) throw err;
                    done();
                });
        });

    });

    describe('login', function() {

        it('should get a 302 response for login (' + object.email + ' , ' + object.password + ')' , function(done) {
            request(app)
                .get('/login')
                .auth(object.email, object.password)
                .expect(302)
                .end(function(err) {
                    if (err) throw err;
                    done();
                });
        });


        it('should be able to get to the profile page for ' + object.email, function(done) {
            request(app)
                .get('/profile')
                .auth(object.email, object.password)
                .expect(200)
                .end(function(err) {
                    if (err) throw err;
                    done();
                });
        });

    });

    describe('room', function() {

        var room = {
            name: Date.now()
        };
        object.room = room.name;
        fs.writeFileSync('test.json', JSON.stringify(object));

        it('should create a room', function(done) {
            request(app)
                .post('/room/create')
                .send(room)
                .set('Accept', 'application/json')
                .auth(object.email, object.password)
                .expect(302)
                .end(function(err) {
                    if (err) throw err;
                    done();
                });
        });

        for (var i = 0; i < 10; i++) {
            it('should add message to room: ' + room.name, function(done) {
                request(app)
                    .post('/' + room.name + '/messages')
                    .send({
                        message: chance.sentence()
                    })
                    .set('Accept', 'application/json')
                    .auth(object.email, object.password)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        assert.isString(res.body.title);
                        assert.isArray(res.body.messages);
                        done();
                    });
            });
        }

        it('should test json route', function(done) {
            request(app)
                .get('/' + room.name + '/json')
                .auth(object.email, object.password)
                .expect(200)
                .end(function(err, res) {
                    if (err) throw err;
                    assert.isString(res.body.title);
                    assert.isArray(res.body.messages);
                    done();
                });
        });
    });

});
