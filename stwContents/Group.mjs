/*!
 * Group
 * Copyright(c) 2020 Giancarlo Trevisan
 * MIT Licensed
 */
import { WEBBASE } from '../stwElements/Miscellanea.mjs';
import Content from '../stwElements/Content.mjs';

export default class Group extends Content {
    constructor(params) {
        super(params);
		delete this.cssClass;

        this.options = params.options || [];
    }

    set Sequence(value) {
        if (value === undefined) return this.sequence;
        this.sequence = isNaN(value) || value < 1 ? 1 : value;
        if (this.parent) // Order by section, sequence
            this.parent.children.sort((a, b) =>
                a._section + ('0000' + a._sequence.toFixed(2)).slice(-5) > b._section + ('0000' + b._sequence.toFixed(2)).slice(-5));
        return this;
    }
    render(req, res, next) {
        return ' ';
    }
}
