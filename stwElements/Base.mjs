/*!
 * Base
 * Copyright(c) 2017 Giancarlo Trevisan
 * MIT Licensed
 */
import { v1 } from 'uuid';
import { WEBBASE } from './Miscellanea.mjs';

export default class Base {
	static [WEBBASE] = {};

	constructor(params = {}) {
		this._id = (Base[WEBBASE].hasOwnProperty('index') && Base[WEBBASE].index.get(params._id) ? v1() : params._id) || v1();
		this._idParent = params._idParent;
		// Object.defineProperty(this, '_idParent', { writable: true }); 

		this.type = this.constructor.name;
		this.status = params.status || 'U';
		this.name = params.name || { [this.lang || 'en']: this.constructor.name };
		this.slug = params.slug || { [this.lang || 'en']: this.name[this.lang || 'en'].replace(/[^a-z0-9_]/gi, '').toLowerCase() };
		this.children = [];
		this.visibility = params.visibility || {}; // [role: { false | true }] Role Based Visibilities
	}

	patch(lang, params = {}) {
		this.status = params.status;
		this.name = { [lang]: params.name };
		if (this.constructor.name != 'Webo')
			this.slug = { [lang]: params.slug.replace(/[^a-z0-9_]/gi, '').toLowerCase() };

		return this;
	}

	get parent() {
		return Base[WEBBASE].index.get(this._idParent);
	}

	localizedName(lang) {
		return this.name[lang] || this.name[0];
	}

	// NOTE: Role management is allowed only to the administrators role
	role(name, enabled) {
		if (this.users[this.user()].roles.indexOf('administrators') !== -1)
			return -1;
		if (!this.visibility[name])
			this.visibility[name] = {};
		this.visibility[name].enabled = (enabled || name === 'administrators' || name === 'guests') ? true : false;
		return 0;
	}

	// Grant a role access control, if no access control is specified remove the role from the RBV list (Role Based Visibility).
	grant(role, ac) {
		if (this.visibility[role] && !ac)
			delete this.visibility[role];
		else
			this.visibility[role] = ac ? 1 : 0;
		return this;
	}

	// Return the highest access control associated to the given roles
	granted(roles, role = null, recurse = false) {
		let ac = null;

		if (this.constructor.name === 'Page' && Base[WEBBASE].mainpage === this._id)
			ac = recurse ? 0b11 : 0b01; // Home page always visible

		if (role) {
			if (this.visibility[role] !== undefined)
				ac = this.visibility[role] ? 0b01 : 0b00;
		} else
			for (let i = 0; ac != 0b01 && i < roles.length; ++i)
				if (this.visibility.hasOwnProperty(roles[i]) && this.visibility[roles[i]] !== null)
					ac |= this.visibility[roles[i]] ? 0b01 : 0b00;

		if (ac === null) {
			let obj = this.parent;
			if (obj)
				ac = 0b10 | obj.granted(roles, role, true);
			else if (['Webo', 'Area', 'Page'].indexOf(this.constructor.name) === -1) // Content
				ac = 0b10; // NOTE: this covers contents without a parent nor a RBV, it's in limbo!
		}

		return ac || 0b00;
	}

	add(child) {
		if (this.constructor.name === 'Page' && (child.constructor === 'Area' || child.constructor.name === 'Page'))
			return {};

		if (child && child.constructor.name !== 'Webo' && child._id !== this._id && this.children.indexOf(child) === -1) {
			child._idParent = this._id;
			this.children.push(child);
			Base[WEBBASE].index.set(child._id, child);
		}
		return child;
	}

	permalink(lang) {
		if (this.parent)
			return this.parent.permalink(lang) + '/' + this.slug[lang];
		return '';
	}
}
