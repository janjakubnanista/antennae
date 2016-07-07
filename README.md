# Antennae
A wrapper around mustache.js template engine that allows you to render your templates easily.

[![Build Status](https://travis-ci.org/janjakubnanista/antennae.svg?branch=master)](https://travis-ci.org/janjakubnanista/antennae)

## Motivation

This module serves as a registry for your Mustache templates. It is capable of automatically going through DOM in the browser
and creating a dictionary of templates. You can then easily render these by calling `antennae.render(templateName, optionalTemplateData)`.

## Installation

antennae is available as an NPM module. To install it please run

    $ npm install --save antennae

from your project root folder.

## Usage

The usage generally consist of two phases - template registration and template rendering.

### Template registration

There are two basic ways of registering templates using `antennae`.

#### Parsing templates from DOM

This is the major use case for this module. `antennae` will traverse your DOM looking for `<script>` tags with type set to `text/html` or `x-tmpl-mustache`. These templates will be registered on `antennae` object using the `data-name` or `id` attribute of the corresponding `<script>` tag.

An example of this are the following templates:

    <script type="text/html" data-name="my-template">
        Hello {{name}}!
    </script>

    <script type="text/html" id="my-template">
        Hello {{name}}!
    </script>

    <script type="x-tmpl-mustache" id="my-template">
        Hello {{name}}!
    </script>

The following templates will cause `antennae` to throw an error since the `data-name` and `id` attributes are missing:

    <script type="text/html">
        Hello {{name}}!
    </script>

And finally this template will be ignored completely since the type is incorrect:

    <script type="text/x-html-teplate" data-name="my-temlate">
        Hello {{name}}!
    </script>

You can also use `<![CDATA]]>` markup elements if you need the HTML to be XML parseable (for example when using Petal template engine on your server):

    <!-- This template -->
    <script type="text/html" id="my-template">
        <![CDATA
        <input {{#disabled}}disabled="disabled"{{/disabled}}/>
        ]]>
    </script>

    <!-- Is in effect the same as this one -->
    <script type="text/html" id="my-template">
        <input {{#disabled}}disabled="disabled"{{/disabled}}/>
    </script>

To explicitly exclude an otherwise valid template you can set `data-antennae-ignore` HTML attribute on a `<script>` tag to any non-empty value:

    <script type="text/html" id="my-template" data-antennae-ignore="true">
        Hello {{name}}!
    </script>

**If you want the templates to be automatically loaded after DOM is loaded** you can require `antennae/lib/autoload` instead. This feature requires browser support for [document.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) and [DOMContentLoaded event](https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded) (IE9+):

    // In your script file
    // Do not forget to execute the autoload module!
    require('antennae/lib/autoload')();

    // You can optionally pass a hash of options to this function
    var options = { processTemplate: function() { ... } };
    require('antennae/lib/autoload')(options);

**If you want to load the templates from DOM yourself** you can use the `antennae.load()` method:

    // In your script file
    var antennae = require('antennae');

    // Then when your DOM is ready
    antennae.load();

    // You can optionally pass a hash of options to this function
    var options = { processTemplate: function() { ... } };
    antennae.load(options);

#### Manually registering templates

This is also possible and can be used with dynamically loaded templates for example.

The following snippet demonstrates this usage:

    // In your script file
    var antennae = require('antennae');

    var templateName = 'my-template';
    var templateString = 'Hello {{name}}!';

    antennae.register(templateName, templateString);

### Template rendering

This process is very easy and straightforward:

    // In your script file
    var antennae = require('antennae');

    // Your template registration code here...

    // And finally the actual rendering
    var rendered = antennae.render('my-template', { name: 'world' });

## API

&bull; `antennae.load(Object options)` Parses DOM and looks for `<script>` tags with type set to `text/html`. The templates from these tags are registered under names obtained from either `data-name` or `id` attributes of these script tags. The only supported option is `processTemplate`:

`Function processTemplate(String templateString, String name, HTMLScriptElement tag)` allows you to make adjustments to template string after it is retrieved from HTML and before it is registered. You can use this hook to replace HTML entities etc.

&bull; `antennae.has(String name)` Checks whether a template with specified name was registered. Returns boolean `true` or `false`.

&bull; `antennae.get(String name)` Returns a registered template or throws an error if there is no template registered under `name`.

&bull; `antennae.register(String name, String template)` Registers a template. **Note that manual registration does not perform `<![CDATA[]]>` removal**. Returns the `antennae` object.

&bull; `antennae.clear()` Unregisters all the templates. Returns `antennae` object.

&bull; `antennae.render(String name[, Object data])` Renders a template registered under the specified name. Throws an error if no such template was registered. Returns rendered template as a String.

## Acknowledgements

This project was inspired by [ICanHaz.js](https://github.com/HenrikJoreteg/ICanHaz.js) module that unfortunately did not meet my requirements.
