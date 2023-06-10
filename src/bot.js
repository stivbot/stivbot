const { Configuration, OpenAIApi } = require("openai");
const { Idea } = require('./idea.js');
const SECTION = require('./section.js');

class Bot {

    MESSAGE_NEW_ISSUE = "Hello, my name is STIV. My goal is to assist you to enhance your business ideas.\n\nDo you want my help on this issue?\nYes\nNo"

	  constructor(openai_api_key) {
		    //this.openAi = new OpenAi(openai_api_key);
	  }

    async newIssue(context) {
        // https://octokit.github.io/rest.js/v19#issues-create-comment
        return await context.octokit.issues.createComment(
            context.issue({ body:  this.MESSAGE_NEW_ISSUE})
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
        let idea = new Idea(issue);

        console.log(`Current state: ${idea.state}`);
        console.log('Sections');
        console.log(idea.sections);

        //Compute the appropriate anwser for the current idea
        const before = idea.state; //TODO remove
        const answer = await this.compute(idea);

        console.log(`New state: ${idea.state}`);

        //Edit first bot message
        return await context.octokit.issues.updateComment(
            context.repo({
                comment_id: comment.id,
                body: `Going from ${before} to ${idea.state}`,
            })
        );
    }

    async compute(idea) {
        switch (idea.state) {
            case STATE.NEW:
                await this.goToUnstructured(idea);
                idea.state = STATE.UNSTRUCTURED;
                break;
            case STATE.UNSTRUCTURED:
                if (idea.sections.hasOwnProperty(SECTION.PROBLEMATIC)) {
                    await this.goToP(idea);
                    idea.state = STATE.P;
                }
                break;
            case STATE.P:
                if (idea.sections.hasOwnProperty(SECTION.PROBLEMATIC) && idea.sections.hasOwnProperty(SECTION.SOLUTION)) {
                    await this.goToPS(idea);
                    idea.state = STATE.PS;
                }
                break;
            case STATE.PS:
                break;
            default:
                //Nothing to do
        }

        //TODO build full answer (answers + dashboard + history) 
    }

    async goToStateUnstructured(idea) {
        //Nothing to do
    }

    async goToP(idea) {
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
