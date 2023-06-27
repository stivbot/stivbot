const { AbstractBuilder } = require('../abstract/abstractBuilder');
const LOCALE = require('../../locale');

class GithubBuilder extends AbstractBuilder {
    static SEPARATOR = "\n--------------\n";

    constructor(idea, answer, repo) {
        if (repo == null) {
            throw new NullAttributeError("repo");
        }
        super(idea, answer);
        this.private = repo.data.private;
    }

    #buildDashboard() {
        var markdown = "";

        //If the repo is private
        if (this.private) {
            //Add info message
            markdown += LOCALE.GITHUB.get("github.private");
        }
        //If the repo is public
        else {
            //Add warning message
            markdown += LOCALE.GITHUB.get("github.public");
        }

        //Add dashboard
        markdown += this.dashboard.toMarkdown();

        return markdown;
    }

    #buildComment() {
        return this.answer.toMarkdown();
    }

    build() {
        const dashboard = this.#buildDashboard();
        const comment = this.#buildComment();
        return {dashboard, comment};
    }
}

module.exports = {
    GithubBuilder
}
