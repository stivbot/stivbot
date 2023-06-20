const { Dashboard } = require('./dashboard');
const { NullAttributeError } = require('../../error')

class AbstractBuilder {
    constructor(idea, advice, action) {
        if (idea == null) {
            throw new NullAttributeError("idea");
        }
        if (advice == null) {
            throw new NullAttributeError("advice");
        }
        if (action == null) {
            throw new NullAttributeError("action");
        }

        this.advice = advice;
        this.action = action;
        this.dashboard = new Dashboard(idea);
    }

    build() {
        throw new Error('Build method not implemented');
    }
}

module.exports = {
    AbstractBuilder
}
