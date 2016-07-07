'use strict';

var antennae = require('./index');

module.exports = function(options) {
    document.addEventListener('DOMContentLoaded', function() {
        antennae.load(options);
    });
};
