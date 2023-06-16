const { OpenAi } = require("./openai.js");
const { Idea } = require('./idea.js');
const SECTION = require('./section.js');
const { TrueFalseMatcher } = require("./matcher.js");
const PropertiesReader = require('properties-reader');


// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

class Bot {

    PROPERTIES = PropertiesReader('static/properties/github.properties');

	constructor() {
		this.openAi = new OpenAi();
	}

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
        await idea.fetch();

        console.log(`Current state: ${idea.state}`);
        console.log('Sections');
        console.log(idea.sections);

        //Compute the appropriate anwser for the current idea
        const before = idea.state; //TODO remove
        const response = await this.compute(idea);

        //Save idea in database
        await idea.save();

        //Edit first bot message
        return await context.octokit.issues.updateComment(
            context.repo({
                comment_id: comment.id,
                body: `Going from ${before} to ${idea.state}\n\n${response}`,
            })
        );
    }

    async compute(idea) {
        var response = null;
        switch (idea.state) {
            case STATE.NEW:
                response = await this.goToStateUnstructured(idea);
                idea.state = STATE.UNSTRUCTURED;
                break;
            case STATE.UNSTRUCTURED:
                if (idea.sections.hasOwnProperty(SECTION.PROBLEMATIC)) {
                    response = await this.goToStateP(idea);
                    idea.state = STATE.P;
                }
                break;
            case STATE.P:
                if (idea.sections.hasOwnProperty(SECTION.PROBLEMATIC) && idea.sections.hasOwnProperty(SECTION.SOLUTION)) {
                    response = await this.goToStatePS(idea);
                    idea.state = STATE.PS;
                }
                break;
            case STATE.PS:
                break;
            default:
                //Nothing to do
        }

        //TODO build full answer (answers + dashboard + history)
        return response;
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
}

module.exports = {
	  Bot
}
