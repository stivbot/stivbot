const { AbstractBot } = require('../abstract/abstractBot');
const { TrueFalseMatcher } = require("../../lib/matcher");
const { GithubParser } = require('./githubParser');
const { GithubBuilder } = require('./githubBuilder');
const { Answer } = require('../abstract/answer');
const LOCALE = require('../../locale');
const STATE = require('../../state')

class GithubBot extends AbstractBot {

    /*bind() {
        app.post('/new_issue', (req, res) => {
            this.newIssue(context);
        });

        app.post('/issue_edited', (req, res) => {
            this.issueEdited(context);
        });
    }*/

    // ---------- GITHUB LISTENERS ----------

    async newIssue(context) {
        // https://octokit.github.io/rest.js/v19#issues-create-comment
        /*await context.octokit.issues.createComment(
            context.issue({ body: LOCALE.GITHUB.get("github.new.1")})
        );*/
        
        await this.reactionToComment(context); //Temporary bypass until reaction webhooks are implemented
    }

    async reactionToComment(context) {        
        //TODO - Reaction webhook not available yet

        //If reaction is thumb up
            // Get issue
            const issue = await this.#getIssue(context);

            //Parse the issue
            const parser = new GithubParser(issue);
            const idea = parser.parse(issue);

            // Set next state
            idea.next_state = STATE.UNSTRUCTURED;

            // Save idea in database
            await idea.save();

            // Compute new comment
            await this.issueEdited(context);
        //Else if reaction is thumb down
            //Remove bot comment
    }

    async issueEdited(context) {
        // https://octokit.github.io/rest.js/v19#issues-list-comments

        // Get repo
        const repo = await this.#getRepo(context);

        // Get issue
        const issue = await this.#getIssue(context);

        console.log(`Issue ${issue.data.html_url} edited`);

        //Parse the issue
        const parser = new GithubParser(issue);
        const idea = parser.parse(issue);

        //Fetch idea from database
        await idea.fetch();

        console.log(`Id: ${idea.id}`);
        console.log(`Sections: ${Object.keys(idea.sections)}`);
        console.log(`Current state: ${idea.state}`);

        //Compute the appropriate anwser for the current idea
        const answer = await this.compute(idea);

        console.log(`Next state: ${idea.next_state}`);

        if (answer != null) {

            //Build answer
            const builder = new GithubBuilder(idea, answer, repo);
            const { dashboard, instructions } = builder.build();

            //Create or update dashboard comment
            const dashboard_comment = await this.#getFirstBotComment(context);
            if (dashboard_comment == null) {
                await this.#createBotComment(context, dashboard);
            }
            else {
                await this.#updateBotComment(context, dashboard_comment, dashboard);
            }

            //Create or update instructions comment
            const instructions_comment = await this.#getBotComment(context, idea.state);
            if (instructions_comment == null) {
                await this.#createBotComment(context, instructions);
            }
            else {
                await this.#updateBotComment(context, instructions_comment, instructions);
            }

            //Save idea in database
            await idea.save();
        }
        else {
            console.log("Nothing to do!");
        }
    }

    // ---------- GITHUB API ----------

    async #getIssue(context) {
        return await context.octokit.issues.get(context.issue());
    }

    async #getRepo(context) {
        return await context.octokit.repos.get(context.issue());
    }

    async #getFirstBotComment(context) {
        //Get the app
        let app = await context.octokit.apps.getAuthenticated();

        // Get first bot message
        let comments = await context.octokit.issues.listComments(context.issue());
        for (const comment of comments.data) {
            if (`${app.data.name}[bot]` == comment.user.login) {
                return comment;
            }
        }
        return null;
    }

    async #getBotComment(context, key) {
        //Get the app
        let app = await context.octokit.apps.getAuthenticated();

        // Get first bot message
        let comments = await context.octokit.issues.listComments(context.issue());
        for (const comment of comments.data) {
            if (`${app.data.name}[bot]` == comment.user.login) {
                if (comment.body.contains(GithubBuilder.BOT_COMMENT_KEY_SUBSTRING.format(key))) {
                    return comment;
                }
            }
        }
        return null;
    }

    async #createBotComment(context, body) {
        return await context.octokit.issues.createComment(
            context.issue({ body: body})
        );
    }

    async #updateBotComment(context, comment, body) {
        await context.octokit.issues.updateComment(
            context.repo({
                comment_id: comment.id,
                body: body,
            })
        );
    }

    async stateUnstructured(idea) {
        var answer = null;
        const matcher = new TrueFalseMatcher();

        //Fisrt request to OpenAI
        const conversation_openai_1 = await this.openAi.request(LOCALE.GITHUB.get("github.unstructured.openai.1").format(idea.body));

        //If response is False
        if (!matcher.get(conversation_openai_1.getLastMessage())) {
            answer = new Answer(
                LOCALE.GITHUB.get("github.unstructured.answer.0.title"),
                LOCALE.GITHUB.get("github.unstructured.answer.0.body"),
                LOCALE.GITHUB.get("github.unstructured.answer.1.instructions")
            );
        }
        //If response is True
        else {
            //Second request to AI
            const conversation_openai_2 = await this.openAi.request(LOCALE.GITHUB.get("github.unstructured.openai.2").format(idea.body));
            //If response is False
            if (!matcher.get(conversation_openai_2.getLastMessage())) {
                //Third request to AI
                const conversation_openai_3 = await this.openAi.request(LOCALE.GITHUB.get("github.unstructured.openai.3").format(idea.body));
                answer = new Answer(
                    LOCALE.GITHUB.get("github.unstructured.answer.0.title"),
                    LOCALE.GITHUB.get("github.unstructured.answer.0.body"),
                    LOCALE.GITHUB.get("github.unstructured.answer.2.instructions"),
                    conversation_openai_3.getLastMessage()
                );
            }
            //If response is True
            else {
                //Fourth request to OpenAI
                const conversation_openai_4 = await this.openAi.request(LOCALE.GITHUB.get("github.unstructured.openai.4").format(idea.body));
                answer = new Answer(
                    LOCALE.GITHUB.get("github.unstructured.answer.0.title"),
                    LOCALE.GITHUB.get("github.unstructured.answer.0.body"),
                    LOCALE.GITHUB.get("github.unstructured.answer.3.instructions"),
                    conversation_openai_4.getLastMessage(),
                    conversation_openai_4.getLastMessage()
                );
                idea.next_state = STATE.P;
            }
        }
        return answer;
    }

    async stateP(idea) {
        //Fisrt request to OpenAI
        const conversation_openai_1 = await this.openAi.request(LOCALE.GITHUB.get("github.p.openai.1").format(idea.sections.problematic));

        //Second request to OpenAI
        const conversation_openai_2 = await this.openAi.request(LOCALE.GITHUB.get("github.p.openai.2"), conversation_openai_1);

        const answer = new Answer(
            LOCALE.GITHUB.get("github.p.answer.0.title"),
            LOCALE.GITHUB.get("github.p.answer.0.body"),
            LOCALE.GITHUB.get("github.p.answer.1.instructions"),
            conversation_openai_2.getLastMessage()
        );
        idea.next_state = STATE.PS;

        return answer;
    }

    async statePS(idea) {
        //First request to OpenAI
        const conversation_openai_1 = await this.openAi.request(LOCALE.GITHUB.get("github.ps.openai.1").format(idea.body));

        const answer = new Answer(
            LOCALE.GITHUB.get("github.ps.answer.0.title"),
            LOCALE.GITHUB.get("github.ps.answer.0.body"),
            LOCALE.GITHUB.get("github.ps.answer.1.instructions"),
            conversation_openai_1.getLastMessage(),
            conversation_openai_1.getLastMessage()
        );
        idea.next_state = STATE.NONE;

        return answer;
    }
}

module.exports = {
    GithubBot
}
