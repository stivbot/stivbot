const { NullAttributeError } = require('./error')
const LOCALE = require('./locale');

class Dashboard {
    constructor(idea) {
        if (idea == null) {
            throw new NullAttributeError("idea");
        }

        this.idea = idea;
    }

    toMarkdown() {
        var markdown = "### Dashboard\n\n";

        // Add dashboard
        markdown += LOCALE.GITHUB.get("github.dashboard");

        return markdown;
    }
}

module.exports = {
    Dashboard
}
