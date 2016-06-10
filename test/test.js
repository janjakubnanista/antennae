'use strict';

require('mocha');

var expect = require('expect.js');
var antennae = require('../lib');

function createScript(content, attributes) {
    var script = document.createElement('script');
    script.innerHTML = content;
    Object.keys(attributes).forEach(function(name) {
        script.setAttribute(name, attributes[name]);
    });

    return script;
}

/* global describe, context, it, beforeEach, afterEach */
describe('antennae', function() {
    beforeEach(function() {
        antennae.clear();

        // So that I can easily get rid of all the tags created in test cases
        this.root = document.body.appendChild(document.createElement('div'));
    });

    afterEach(function() {
        document.body.removeChild(this.root);
        this.root = null;
    });

    context('load()', function() {
        it('should not load a template when type is neither text/html nor x-tmpl-mustache', function() {
            this.root.appendChild(createScript('', { type: 'text/javascript', id: 'template-1' }));
            this.root.appendChild(createScript('', { id: 'template-2' }));

            antennae.load();

            expect(antennae.has('template-1')).to.be(false);
            expect(antennae.has('template-2')).to.be(false);
        });

        it('should load a template when type is text/html', function() {
            this.root.appendChild(createScript('', { type: 'text/html', id: 'template-1' }));

            antennae.load();

            expect(antennae.has('template-1')).to.be(true);
        });

        it('should load a template when type is x-tmpl-mustache', function() {
            this.root.appendChild(createScript('', { type: 'x-tmpl-mustache', id: 'template-1' }));

            antennae.load();

            expect(antennae.has('template-1')).to.be(true);
        });

        it('should not load a template when data-ignore HTML attribute is set to truthy value', function() {
            this.root.appendChild(createScript('', { type: 'text/html', id: 'template-1', 'data-ignore': 'yes' }));

            antennae.load();

            expect(antennae.has('template-1')).to.be(false);
        });

        it('should use data-name attribute for template name if present', function() {
            this.root.appendChild(createScript('', { type: 'text/html', 'data-name': 'template-1' }));

            antennae.load();

            expect(antennae.has('template-1')).to.be(true);
        });

        it('should use id attribute if data-name is not present', function() {
            this.root.appendChild(createScript('', { type: 'text/html', id: 'template-1' }));

            antennae.load();

            expect(antennae.has('template-1')).to.be(true);
        });

        it('should throw an error if neither data-name nor id is present', function() {
            this.root.appendChild(createScript('', { type: 'text/html' }));

            expect(function() {
                antennae.load();
            }).to.throwError();
        });

        it('should remove CDATA markup element', function() {
            document.body.appendChild(createScript('\n\t<![CDATA[\n\t\tA template\n\t]]>\n', { type: 'text/html', id: 'template-1' }));

            antennae.load();

            expect(antennae.render('template-1')).to.be('A template');
        });
    });

    context('register()', function() {
        it('should throw an error if name is not specified', function() {
            expect(function() {
                antennae.register('', 'A content');
            }).to.throwError();
        });

        it('should register template', function() {
            antennae.register('template-1', 'A content');

            expect(antennae.has('template-1')).to.be(true);
        });
    });

    context('render()', function() {
        it('should throw an error if template was not registered', function() {
            expect(function() {
                antennae.render('', {});
            }).to.throwError();
        });

        it('should return a string', function() {
            antennae.register('template-1', 'A name: {{name}}');

            expect(antennae.render('template-1', { name: 'Jan' })).to.be.a('string');
        });

        it('should return am interpolated string', function() {
            antennae.register('template-1', 'A name: {{name}}');

            expect(antennae.render('template-1', { name: 'Jan' })).to.be('A name: Jan');
        });
    });

    context('has()', function() {
        it('should return true if a template was registered', function() {
            antennae.register('template-1', 'A name: {{name}}');

            expect(antennae.has('template-1')).to.be(true);
        });

        it('should return false if a template was not registered', function() {
            expect(antennae.has('template-1')).to.be(false);
        });
    });

    context('clear()', function() {
        it('should unregister all templates', function() {
            antennae.register('template-1', 'A name: {{name}}');
            antennae.register('template-2', 'A name: {{name}}');
            antennae.clear();

            expect(antennae.has('template-1')).to.be(false);
            expect(antennae.has('template-2')).to.be(false);
        });
    });
});
