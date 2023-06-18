const { NullAttributeError } = require('../../errors/errors')

class Dashboard {
    constructor(idea) {
        if (idea == null) {
            throw new NullAttributeError("idea");
        }

        this.idea = idea;
    }

    toMarkdown() {
        var markdown = "### Dashboard\n";

        //TODO

        return markdown;
    }
}

module.exports = {
    Dashboard
}
