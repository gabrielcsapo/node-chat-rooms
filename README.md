# node-chat-rooms

[![Npm Version](https://img.shields.io/npm/v/node-chat-rooms.svg)](https://www.npmjs.com/package/node-chat-rooms)
[![Build Status](https://travis-ci.org/gabrielcsapo/node-chat-rooms.svg?branch=master)](https://travis-ci.org/gabrielcsapo/node-chat-rooms)
[![Dependency Status](https://david-dm.org/gabrielcsapo/node-chat-rooms.svg)](https://david-dm.org/gabrielcsapo/node-chat-rooms)
[![devDependency Status](https://david-dm.org/gabrielcsapo/node-chat-rooms/dev-status.svg)](https://david-dm.org/gabrielcsapo/node-chat-rooms#info=devDependencies)
[![npm](https://img.shields.io/npm/dt/node-chat-rooms.svg)]()
[![npm](https://img.shields.io/npm/dm/node-chat-rooms.svg)]()

> open chat rooms for the masses :monkey:

# routes

- `GET /{room}.svg`
    - (renders a badge that shows room name)
- `GET /{room}/count.svg`
    - (renders a badge with the amount of message in a chat room)
- `GET /{room}`
    - (renders the chat room window)
- `GET /{room}/json`
    - 
    ```json
        {
            "title": "testing",
            "messages": [{
                "message": "does this work?",
                "username": "root",
                "date": "2016-06-07 18:34"
            }, {
                "message": "oh great?",
                "username": "root",
                "date": "2016-06-07 18:34"
            }, {
                "message": "this is awesome",
                "username": "root",
                "date": "2016-06-07 18:40"
            }],
            "room": "testing"
        }
    ```
- `POST /{room}/messages`
    - `example`
    - `curl -u root@gmail.com:test123 http://localhost:3000/testing/messages --data "message=this is a message"`

# install

`npm install`


## Dependencies

- mongodb

### OSX

> `brew install mongo;`
