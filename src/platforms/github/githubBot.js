const { AbstractBot } = require('../abstract/abstractBot');
const { Idea } = require('../../idea');
const { TrueFalseMatcher } = require("../../lib/matcher");
const PropertiesReader = require('properties-reader');

class GithubBot extends AbstractBot {

    PROPERTIES = PropertiesReader('static/properties/github.properties');

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
            context.issue({ body:  this.PROPERTIES.get("github.new.1")})
        );
    }

    async issueEdited(context) {
        // https://octokit.github.io/rest.js/v19#issues-list-comments
        
        // Get the bot message
        let comment = await this.#getBotComment(context);

        // Get issue
        let issue = await this.#getIssue(context);

        console.log(`Issue ${issue.data.html_url} edited`);

        //Get idea from text
        var idea = new Idea(issue)

        //Fetch idea from database
        //await idea.fetch();

        console.log(`Current state: ${idea.state}`);
        console.log('Sections');
        console.log(idea.sections);

        //Compute the appropriate anwser for the current idea
        const before = idea.state; //TODO remove
        const response = await this.compute(idea);

        //Save idea in database
        //await idea.save();

        //Edit first bot message
        return await context.octokit.issues.updateComment(
            context.repo({
                comment_id: comment.id,
                body: `Going from ${before} to ${idea.state}\n\n${response}`,
            })
        );
    }

    async #getIssue(context) {
        return await context.octokit.issues.get(context.issue());
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
        if (comment == null)
            throw new Error("Could not find the bot comment");

        return comment;
    }

    async goToStateUnstructured(idea) {
        var response = null;
        const matcher = new TrueFalseMatcher()

        //Fisrt request to OpenAI
        const response_openai_1 = await this.openAi.request(this.PROPERTIES.get("openai.unstructured.1").format(idea.body))

        //If response is False
        if (!matcher.get(response_openai_1)) {
            response = this.PROPERTIES.get("github.unstructured.1");
        }
        //If response is True
        else {
            //Second request to AI
            const response_openai_2 = await this.openAi.request(this.PROPERTIES.get("openai.unstructured.2").format(idea.body))
            //If response is False
            if (!matcher.get(response_openai_2)) {
                //Third request to AI
                var response_openai_3 = await this.openAi.request(this.PROPERTIES.get("openai.unstructured.3").format(idea.body))
                response = this.PROPERTIES.get("github.unstructured.2").format(response_openai_3.replaceAll('\n', '\n> '), response_openai_3, idea.body);
            }
            //If response is True
            else {
                //Fourth request to OpenAI
                const response_openai_4 = await this.openAi.request(this.PROPERTIES.get("openai.unstructured.4").format(idea.body))
                response = this.PROPERTIES.get("github.unstructured.3").format(response_openai_4);
            }
        }
        return response;
    }

    async goToStateP(idea) {
        //Open AI TODO
        //Open AI TODO
    }

    async goToStatePS(idea) {
        //Open AI TODO
    }
}

module.exports = {
    GithubBot
}
