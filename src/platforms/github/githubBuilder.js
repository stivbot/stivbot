const { AbstractBuilder } = require('../abstract/abstractBuilder');
const LOCALE = require('../../locale');

class GithubBuilder extends AbstractBuilder {
    static SEPARATOR = "\n--------------\n";

    constructor(idea, advice, action, repo) {
        if (repo == null) {
            throw new NullAttributeError("repo");
        }
        super(idea, advice, action);
        this.private = repo.data.private;
    }

    build() {
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

        markdown += GithubBuilder.SEPARATOR;

        //Add advice
        markdown += this.advice.toMarkdown();

        markdown += GithubBuilder.SEPARATOR;

        //Add action
        markdown += this.action.toMarkdown();

        markdown += GithubBuilder.SEPARATOR;

        //Add dashboard
        markdown += this.dashboard.toMarkdown();

        return markdown;
    }
}

module.exports = {
    GithubBuilder
}
