/*!
 * Document
 * Copyright(c) 2016 Giancarlo Trevisan
 * MIT Licensed
 */
'use strict';

const url = require('url'),
	fs = require('fs'),
	io = require('socket.io'),
	xmldom = require('xmldom').DOMParser, // Persist webbase in XML
	util = require('../util');

module.exports = wbol => {
	wbol.Document = class Document extends wbol.Chapter {
		constructor(name) {
			super(name);
			this._protocol = 'http';
		}

		protocol(value) {
			if (typeof value === 'undefined') return this._protocol;
			if (value.search(/^https?$/i) !== -1)
				this._protocol = value.toLowerCase();
			this.lastmod = (new Date()).toISOString();
			return this;
		}
		name(value) {
			if (typeof value === 'undefined') return this._name;
			this._name = value;
			this.lastmod = (new Date()).toISOString();
			return this;
		}

		persist() {
			var fragment;
			
			fragment = `<document id="D${this.id}" guid="${this.guid}" lastmod="${this.lastmod}"`;
			
			fragment += super.persist();

			fragment += '</document>\n';
			
			return fragment;
		}
	};
};