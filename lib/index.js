'use strict';

var Mustache = require('mustache');

var TEMPLATES = {};
var SANITIZER = /^\s*(?:<\!\[CDATA\[)?\s*([^]*?)\s*(?:\]\]>)?\s*$/ig;

function ensureDOM() {
    if (typeof(document) === 'undefined') {
        throw new Error('antennae is intended to be used in browser environment');
    }
}

function ensureTemplate(name) {
    if (!(name in TEMPLATES)) {
        throw new Error('Could not find template "' + name + '"');
    }

    return TEMPLATES[name];
}

function isTemplate(scriptTag) {
    var type = scriptTag.type;
    if (type !== 'text/html' && type !== 'x-tmpl-mustache') return false;

    var ignored = !!scriptTag.getAttribute('data-ignore');
    return !ignored;
}

function getTemplateTags() {
    var scriptTags = document.getElementsByTagName('script');
    var templateTags = [];

    for (var i = 0, n = scriptTags.length; i < n; i++) {
        var scriptTag = scriptTags[i];
        if (!isTemplate(scriptTag)) continue;

        templateTags.push(scriptTag);
    }

    return templateTags;
}

function getTemplateString(scriptTag) {
    return scriptTag.innerHTML.replace(SANITIZER, '$1');
}

function getTemplateName(scriptTag) {
    return scriptTag.getAttribute('data-name') || scriptTag.getAttribute('id');
}

exports.register = function register(name, content) {
    if (!name) {
        throw new Error('Template must have a name, only content specified');
    }

    TEMPLATES[name] = content;
    Mustache.parse(content);

    return exports;
};

exports.clear = function clear() {
    TEMPLATES = {};

    return exports;
};

exports.has = function(name) {
    return name in TEMPLATES;
};

exports.load = function load(passedOptions) {
    ensureDOM();

    var options = passedOptions || {};
    var templateTags = getTemplateTags();
    for (var i = 0, n = templateTags.length; i < n; i++) {
        var tag = templateTags[i];
        var name = getTemplateName(tag);
        var string = getTemplateString(tag);
        var templateString = options.processTemplate ? options.processTemplate(string, name, tag) : string;

        exports.register(name, templateString);
    }
};

exports.render = function(name, data) {
    var template = ensureTemplate(name);

    return Mustache.render(template, data, TEMPLATES);
};
