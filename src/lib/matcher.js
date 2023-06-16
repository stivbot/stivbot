const { closestMatch } = require("closest-match");

class Matcher {
    constructor(possibilities) {
        this.possibilities = possibilities;
    }

    get(value){
        return closestMatch(value.trim(), this.possibilities);
    }
}

class MapMatcher extends Matcher {
    constructor(mapping) {
        super(Object.keys(mapping))
        this.mapping = mapping;
    }

    get(value) {
        const match = super.get(value);
        return this.mapping[match];
    }
}

class TrueFalseMatcher extends MapMatcher {
    constructor () {
        super({
            "True": true,
            "False": false,
        });
    }
}

module.exports = {
	Matcher,
	MapMatcher,
	TrueFalseMatcher,
}
