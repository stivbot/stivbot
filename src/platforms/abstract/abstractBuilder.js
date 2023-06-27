const { Dashboard } = require('../../dashboard');
const { NullAttributeError } = require('../../error')

class AbstractBuilder {
    constructor(idea, answer) {
        if (idea == null) {
            throw new NullAttributeError("idea");
        }
        if (answer == null) {
            throw new NullAttributeError("answer");
        }

        this.idea = idea;
        this.answer = answer;
        this.dashboard = new Dashboard(idea);
    }

    build() {
        throw new Error('Build method not implemented');
    }
}

module.exports = {
    AbstractBuilder
}
