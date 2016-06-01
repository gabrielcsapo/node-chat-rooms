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
                        delay: 100,
                    }],
                    viewport: ['1920x1080', '1024x768', '640x960', '320x480']
                }
            },
            login: {
                options: {
                    path: './screenshot/login',
                    files: [{
                        type: 'remote',
                        src: 'http://localhost:3000/login',
                        dest: 'login.png',
                        delay: 100,
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
                        delay: 100,
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
                        delay: 100,
                    }],
                    viewport: ['1920x1080', '1024x768', '640x960', '320x480']
                }
            }
            // TODO: add screenshots for chat rooms and profile page
        }
    });
}
