module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-screenshot');

    grunt.initConfig({
        screenshot: {
            home: {
                options: {
                    path: './screenshot/home',
                    files: [{
                        type: 'remote',
                        src: 'http://localhost:3000',
                        dest: 'home.png',
                        delay: 100
                    }],
                    viewport: ['1920x1080', '1024x768', '640x960', '320x480']
                }
            },
            register: {
                options: {
                    path: './screenshot/register',
                    files: [{
                        type: 'remote',
                        src: 'http://localhost:3000/register',
                        dest: 'register.png',
                        delay: 100
                    }],
                    viewport: ['1920x1080', '1024x768', '640x960', '320x480']
                }
            },
            '404': {
                options: {
                    path: './screenshot/404',
                    files: [{
                        type: 'remote',
                        src: 'http://localhost:3000/404',
                        dest: '404.png',
                        delay: 100,
                        basicAuth: {
                            username: 'root@gmail.com',
                            password: 'test123'
                        }
                    }],
                    viewport: ['1920x1080', '1024x768', '640x960', '320x480']
                }
            },
            roomAuthNeeded: {
                options: {
                    path: './screenshot/room/AuthNeeded',
                    files: [{
                        type: 'remote',
                        src: 'http://localhost:3000/testing',
                        dest: 'AuthNeeded.png',
                        delay: 100
                    }],
                    viewport: ['1920x1080', '1024x768', '640x960', '320x480']
                }
            },
            room: {
                options: {
                    path: './screenshot/room',
                    files: [{
                        type: 'remote',
                        src: 'http://localhost:3000/testing',
                        dest: 'room.png',
                        delay: 500,
                        basicAuth: {
                            username: 'root@gmail.com',
                            password: 'test123'
                        }
                    }],
                    viewport: ['1920x1080', '1024x768', '640x960', '320x480']
                }
            },
            profile: {
                options: {
                    path: './screenshot/profile',
                    files: [{
                        type: 'remote',
                        src: 'http://localhost:3000/profile',
                        dest: 'profile.png',
                        delay: 500,
                        basicAuth: {
                            username: 'root@gmail.com',
                            password: 'test123'
                        }
                    }],
                    viewport: ['1920x1080', '1024x768', '640x960', '320x480']
                }
            }
        }
    });
};
