/*!
 * list
 * Copyright(c) 2017 Giancarlo Trevisan
 * MIT Licensed
 */
import { WEBBASE } from '../elements/Constants.mjs';
import Content from '../elements/Content.mjs';

export default class List extends Content {
	constructor(name, template, lang) {
		super(name, template, lang, true);
	}

	Render(socket) {
		return super.Render(socket, (socket, template) => {
			let fragment = '<ul>';

			if (!this.datasource()) { // TODO: set the content datasource, query amd template
				this._clientHandler = function stwListRoles(event) {
					event.stopPropagation();
					event.preventDefault();
					let target = event.target.closest('li'), article = target.closest('article');
					stw.send(JSON.stringify({
						id: article.id, url: null, role: target.innerText, grant: [undefined, 0, 1, 1][parseInt(target.dataset.ref, 10)]
					}));
				};
				this._serverHandler = (element, socket) => {
					element.grant(socket.data.role, socket.data.grant);
					socket.emit('content', element.id);
				};

				let id = socket.data.searchParams.id || this[WEBBASE].id;
				let el = this[WEBBASE].getElementById(id); // Roled Based Visibility
				for (let role in this[WEBBASE].roles) {
					let granted = el.granted(socket.target.user, role);
					fragment += `<li class="stwRBVIcn${granted}" onclick="stwListRoles(event)" data-ref="${granted}"> ${role}</li>`;
				}
			} else {
				socket.dataset.forEach(function (row, i) {
					socket.datarow = row;
					fragment += `<li>${this.renderRow(socket, this.id, template)}</li>`; // TODO: render template recursively
				});
			}

			return fragment + '</ul>';
		});
	}
}