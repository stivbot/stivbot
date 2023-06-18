const { AbstractBot } = require('../abstract/abstractBot');
const { TrueFalseMatcher } = require("../../lib/matcher");
const { GithubParser } = require('./githubParser');
const { GithubBuilder } = require('./githubBuilder');
const { Advice } = require('../abstract/advice');
const { Action } = require('../abstract/action');
const LOCALE = require('../../locale');

class GithubBot extends AbstractBot {

    /*bind() {
        app.post('/new_issue', (req, res) => {
            this.newIssue(context);
        });

        app.post('/issue_edited', (req, res) => {
            this.issueEdited(context);
        });
    }*/

    async newIssue(context) {
        // https://octokit.github.io/rest.js/v19#issues-create-comment
        return await context.octokit.issues.createComment(
            context.issue({ body:  LOCALE.GITHUB.get("github.new.1")})
        );
    }

    async issueEdited(context) {
        // https://octokit.github.io/rest.js/v19#issues-list-comments
        
        // Get the bot message
        let comment = await this.#getBotComment(context);

        // Get repo
        let repo = await this.#getRepo(context);

        // Get issue
        let issue = await this.#getIssue(context);

        console.log(`Issue ${issue.data.html_url} edited`);

        //Parse the issue
        const parser = new GithubParser(issue);
        const idea = parser.parse(issue);

        //Fetch idea from database
        await idea.fetch();

        console.log(`Id: ${idea.id}`);
        console.log(`Current state: ${idea.state}`);
        console.log(`Sections: ${Object.keys(idea.sections)}`);

        //Compute the appropriate anwser for the current idea
        const before = idea.state; //TODO remove
        const {advice, action} = await this.compute(idea);

        //Build answer
        const builder = new GithubBuilder(idea, advice, action, repo);
        const markdown = builder.build();

        //Save idea in database
        await idea.save();

        //Edit first bot message
        return await context.octokit.issues.updateComment(
            context.repo({
                comment_id: comment.id,
                body: markdown,
            })
        );
    }

    async #getIssue(context) {
        return await context.octokit.issues.get(context.issue());
    }

    async #getRepo(context) {
        return await context.octokit.repos.get(context.issue());
    }

    async #getBotComment(context) {
        //Get the app
        let app = await context.octokit.apps.getAuthenticated()

        // Get first bot message
        let comment = null;
        let comments = await context.octokit.issues.listComments(context.issue());
        for (const c of comments.data) {
            if (`${app.data.name}[bot]` == c.user.login) {
                comment = c;
            }
        }
        if (comment == null) {
            throw new Error("Could not find the bot comment");
        }

        return comment;
    }

    async goToStateUnstructured(idea) {
        var advice = null;
        var action = null;
        const matcher = new TrueFalseMatcher()

        //Fisrt request to OpenAI
        const response_openai_1 = await this.openAi.request(LOCALE.GITHUB.get("github.unstructured.openai.1").format(idea.body))

        //If response is False
        if (!matcher.get(response_openai_1)) {
            advice = new Advice(LOCALE.GITHUB.get("github.unstructured.advice.1"));
            action = new Action(LOCALE.GITHUB.get("github.unstructured.action.1"));
        }
        //If response is True
        else {
            //Second request to AI
            const response_openai_2 = await this.openAi.request(LOCALE.GITHUB.get("github.unstructured.openai.2").format(idea.body))
            //If response is False
            if (!matcher.get(response_openai_2)) {
                //Third request to AI
                var response_openai_3 = await this.openAi.request(LOCALE.GITHUB.get("github.unstructured.openai.3").format(idea.body))
                advice = new Advice(LOCALE.GITHUB.get("github.unstructured.advice.2"), response_openai_3);
                action = new Action(LOCALE.GITHUB.get("github.unstructured.action.2"));
            }
            //If response is True
            else {
                //Fourth request to OpenAI
                const response_openai_4 = await this.openAi.request(LOCALE.GITHUB.get("github.unstructured.openai.4").format(idea.body))
                advice = new Advice(LOCALE.GITHUB.get("github.unstructured.advice.3"), response_openai_4);
                action = new Action(LOCALE.GITHUB.get("github.unstructured.action.3"), response_openai_4);
            }
        }
        return {advice, action};
    }
}

module.exports = {
    GithubBot
}
