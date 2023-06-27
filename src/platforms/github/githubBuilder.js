const { AbstractBuilder } = require('../abstract/abstractBuilder');
const LOCALE = require('../../locale');

class GithubBuilder extends AbstractBuilder {

    static SEPARATOR = "\n--------------\n";

    static BOT_COMMENT_KEY_SUBSTRING = "<!-- key:{0} -->\n"
    static BOT_COMMENT_KEY_DASHBOARD = "DASHBOARD"

    constructor(idea, answer, repo) {
        if (repo == null) {
            throw new NullAttributeError("repo");
        }
        super(idea, answer);
        this.private = repo.data.private;
    }

    #buildDashboard() {
        var markdown = GithubBuilder.BOT_COMMENT_KEY_SUBSTRING.format(GithubBuilder.BOT_COMMENT_KEY_DASHBOARD);

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

    #buildInstructions() {
        var markdown = GithubBuilder.BOT_COMMENT_KEY_SUBSTRING.format(this.idea.state);
        markdown += this.answer.toMarkdown();
        return markdown;
    }

    build() {
        const dashboard = this.#buildDashboard();
        const instructions = this.#buildInstructions();
        return {dashboard, instructions};
    }
}

module.exports = {
    GithubBuilder
}
