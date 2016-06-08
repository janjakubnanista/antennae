'use strict';

var Mustache = require('mustache');

var TEMPLATES = {};
var SANITIZER = /^\s*(?:<\!\[CDATA\[)?(.*?)(?:\]\]>)?\s*$/ig;

function ensureDOM() {
    if (typeof(document) === 'undefined') {
        throw new Error('whiskers is intended to be used in browser environment');
    }
}

function ensureTemplate(name) {
    if (!(name in TEMPLATES)) {
        throw new Error('Could not find template "' + name + '"');
    }

    return TEMPLATES[name];
}

function getTemplateTags() {
    var scriptTags = document.getElementsByTagName('script');
    var templateTags = [];

    for (var i = 0, n = scriptTags.length; i < n; i++) {
        var scriptTag = scriptTags[i];
        if (scriptTag.type !== 'text/html') continue;

        templateTags.push(scriptTag);
    }

    return templateTags;
}

function getTemplateString(element) {
    return element.innerHTML.replace(SANITIZER, '$1');
}

function getTemplateName(element) {
    console.log(element, element.getAttribute('data-name') || element.getAttribute('id'));

    return element.getAttribute('data-name') || element.getAttribute('id');
}

exports.register = function register(name, content) {
    if (!name) {
        throw new Error('Template must have a name, only content specified');
    }

    TEMPLATES[name] = content;
    Mustache.parse(content);
};

exports.clear = function clear() {
    TEMPLATES = {};
};

exports.has = function(name) {
    return name in TEMPLATES;
};

exports.load = function load() {
    ensureDOM();

    var templateTags = getTemplateTags();
    templateTags.forEach(function(element) {
        var name = getTemplateName(element);
        var string = getTemplateString(element);

        exports.register(name, string);
    });
};

exports.render = function(name, data) {
    var template = ensureTemplate(name);

    return Mustache.render(template, data, TEMPLATES);
};
