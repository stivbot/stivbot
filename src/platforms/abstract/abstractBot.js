const { OpenAi } = require("../../lib/openai");
const SECTION = require('../../section');
const { TrueFalseMatcher } = require("../../lib/matcher");
const { Answer } = require('../../answer');
const LOCALE = require('../../locale');

class AbstractBot {

	constructor() {
		this.openAi = new OpenAi();
	}

    async compute(idea) {
        var answer = null;
        switch (idea.state) {
            case STATE.NONE:
                break;
            case STATE.NEW:
                break;
            case STATE.UNSTRUCTURED:
                answer = await this.stateUnstructured(idea);
                break;
            case STATE.P:
                if (idea.sections.hasOwnProperty(SECTION.PROBLEMATIC) && idea.sections.hasOwnProperty(SECTION.SOLUTION)) {
                    answer = await this.stateP(idea);
                }
                break;
            case STATE.PS:
                if (idea.sections.hasOwnProperty(SECTION.PROBLEMATIC) && idea.sections.hasOwnProperty(SECTION.SOLUTION)) {
                    answer = await this.statePS(idea);
                }
                break
            default:
                throw new Error(`Unknown state: ${idea.state}`);
        }
        return answer;
    }
    

    async stateUnstructured(idea) {
        var answer = null;
        const matcher = new TrueFalseMatcher();

        //Fisrt request to OpenAI
        const conversation_openai_1 = await this.openAi.request(LOCALE.ABSTRACT.get("state.unstructured.openai.1").format(idea.body));

        //If response is False
        if (!matcher.get(conversation_openai_1.getLastMessage())) {
            answer = new Answer(
                LOCALE.ABSTRACT.get("state.unstructured.answer.0.title"),
                LOCALE.ABSTRACT.get("state.unstructured.answer.0.body"),
                LOCALE.ABSTRACT.get("state.unstructured.answer.1.instructions")
            );
        }
        //If response is True
        else {
            //Second request to AI
            const conversation_openai_2 = await this.openAi.request(LOCALE.ABSTRACT.get("state.unstructured.openai.2").format(idea.body));
            //If response is False
            if (!matcher.get(conversation_openai_2.getLastMessage())) {
                //Third request to AI
                const conversation_openai_3 = await this.openAi.request(LOCALE.ABSTRACT.get("state.unstructured.openai.3").format(idea.body));
                answer = new Answer(
                    LOCALE.ABSTRACT.get("state.unstructured.answer.0.title"),
                    LOCALE.ABSTRACT.get("state.unstructured.answer.0.body"),
                    LOCALE.ABSTRACT.get("state.unstructured.answer.2.instructions"),
                    conversation_openai_3.getLastMessage()
                );
            }
            //If response is True
            else {
                //Fourth request to OpenAI
                const conversation_openai_4 = await this.openAi.request(LOCALE.ABS.get("state.unstructured.openai.4").format(idea.body));
                answer = new Answer(
                    LOCALE.ABSTRACT.get("state.unstructured.answer.0.title"),
                    LOCALE.ABSTRACT.get("state.unstructured.answer.0.body"),
                    LOCALE.ABSTRACT.get("state.unstructured.answer.3.instructions"),
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
        const conversation_openai_1 = await this.openAi.request(LOCALE.ABSTRACT.get("state.p.openai.1").format(idea.sections.problematic));

        //Second request to OpenAI
        const conversation_openai_2 = await this.openAi.request(LOCALE.ABSTRACT.get("state.p.openai.2"), conversation_openai_1);

        const answer = new Answer(
            LOCALE.ABSTRACT.get("state.p.answer.0.title"),
            LOCALE.ABSTRACT.get("state.p.answer.0.body"),
            LOCALE.ABSTRACT.get("state.p.answer.1.instructions"),
            conversation_openai_2.getLastMessage()
        );
        idea.next_state = STATE.PS;

        return answer;
    }

    async statePS(idea) {
        //First request to OpenAI
        const conversation_openai_1 = await this.openAi.request(LOCALE.ABSTRACT.get("state.ps.openai.1").format(idea.body));

        const answer = new Answer(
            LOCALE.ABSTRACT.get("state.ps.answer.0.title"),
            LOCALE.ABSTRACT.get("state.ps.answer.0.body"),
            LOCALE.ABSTRACT.get("state.ps.answer.1.instructions"),
            conversation_openai_1.getLastMessage(),
            conversation_openai_1.getLastMessage()
        );
        idea.next_state = STATE.NONE;

        return answer;
    }
}

module.exports = {
    AbstractBot
}
