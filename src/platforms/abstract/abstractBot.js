const { OpenAi } = require("../../lib/openai");
const SECTION = require('../../section');
const { TrueFalseMatcher } = require("../../lib/matcher");
const { Answer } = require('../../answer');
const LOCALE = require('../../locale');
const STATE = require('../../state');

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
            case STATE.PROBLEMATIC:
                if (idea.sections.hasOwnProperty(SECTION.PROBLEMATIC) && idea.sections.hasOwnProperty(SECTION.SOLUTION)) {
                    answer = await this.stateProblematic(idea);
                }
                break;
            case STATE.PROBLEMATIC_SOLUTION:
                if (idea.sections.hasOwnProperty(SECTION.PROBLEMATIC) && idea.sections.hasOwnProperty(SECTION.SOLUTION)) {
                    answer = await this.stateProblematicSolution(idea);
                }
                break
            case STATE.HOW_IT_WORKS:
                if (idea.sections.hasOwnProperty(SECTION.PROBLEMATIC) &&
                  idea.sections.hasOwnProperty(SECTION.SOLUTION) &&
                  idea.sections.hasOwnProperty(SECTION.PROS) &&
                  idea.sections.hasOwnProperty(SECTION.CONS)) {
                    answer = await this.stateHowItWorks(idea);
                }
                break
            case STATE.TECHNOLOGY:
                if (idea.sections.hasOwnProperty(SECTION.PROBLEMATIC) &&
                  idea.sections.hasOwnProperty(SECTION.SOLUTION) &&
                  idea.sections.hasOwnProperty(SECTION.PROS) &&
                  idea.sections.hasOwnProperty(SECTION.CONS)) {
                    answer = await this.stateTechnology(idea);
                }
                break
            case STATE.CUSTOMERS:
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
                LOCALE.ABSTRACT.get("state.unstructured.answer.title"),
                LOCALE.ABSTRACT.get("state.unstructured.answer.body"),
                LOCALE.ABSTRACT.get("state.unstructured.answer.instructions.1")
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
                    LOCALE.ABSTRACT.get("state.unstructured.answer.title"),
                    LOCALE.ABSTRACT.get("state.unstructured.answer.body"),
                    LOCALE.ABSTRACT.get("state.unstructured.answer.instructions.2"),
                    conversation_openai_3.getLastMessage()
                );
            }
            //If response is True
            else {
                //Fourth request to OpenAI
                const conversation_openai_4 = await this.openAi.request(LOCALE.ABSTRACT.get("state.unstructured.openai.4").format(idea.body));
                answer = new Answer(
                    LOCALE.ABSTRACT.get("state.unstructured.answer.title"),
                    LOCALE.ABSTRACT.get("state.unstructured.answer.body"),
                    LOCALE.ABSTRACT.get("state.unstructured.answer.instructions.3"),
                    conversation_openai_4.getLastMessage(),
                    conversation_openai_4.getLastMessage()
                );
                idea.next_state = STATE.PROBLEMATIC;
            }
        }
        return answer;
    }

    async stateProblematic(idea) {
        //Fisrt request to OpenAI
        const conversation_openai_1 = await this.openAi.request(LOCALE.ABSTRACT.get("state.p.openai.1").format(idea.sections.problematic));

        //Second request to OpenAI
        const conversation_openai_2 = await this.openAi.request(LOCALE.ABSTRACT.get("state.p.openai.2"), conversation_openai_1);

        const answer = new Answer(
            LOCALE.ABSTRACT.get("state.p.answer.title"),
            LOCALE.ABSTRACT.get("state.p.answer.body"),
            LOCALE.ABSTRACT.get("state.p.answer.instructions.1"),
            conversation_openai_2.getLastMessage()
        );
        idea.next_state = STATE.PROBLEMATIC_SOLUTION;

        return answer;
    }

    async stateProblematicSolution(idea) {
        //First request to OpenAI
        const conversation_openai_1 = await this.openAi.request(LOCALE.ABSTRACT.get("state.ps.openai.1").format(idea.body));

        const answer = new Answer(
            LOCALE.ABSTRACT.get("state.ps.answer.title"),
            LOCALE.ABSTRACT.get("state.ps.answer.body"),
            LOCALE.ABSTRACT.get("state.ps.answer.instructions.1"),
            conversation_openai_1.getLastMessage(),
            conversation_openai_1.getLastMessage()
        );
        idea.next_state = STATE.TECHNOLOGY;

        return answer;
    }

    async stateHowItWorks(idea) {
        const conversation_openai_1 = await this.openAi.request(LOCALE.ABSTRACT.get("state.how_it_works.openai.1").format(idea.sections.problematic, idea.sections.solution));

        const answer = new Answer(
            LOCALE.ABSTRACT.get("state.how_it_works.answer.title"),
            LOCALE.ABSTRACT.get("state.how_it_works.answer.body"),
            LOCALE.ABSTRACT.get("state.how_it_works.answer.instructions.1"),
            conversation_openai_1.getLastMessage(),
            conversation_openai_1.getLastMessage()
        );
        idea.next_state = STATE.TECHNOLOGY;

        return answer;
    }

    async stateTechnology(idea) {
        const conversation_openai_1 = await this.openAi.request(LOCALE.ABSTRACT.get("state.technology.openai.1").format(idea.sections.problematic, idea.sections.solution));

        const answer = new Answer(
            LOCALE.ABSTRACT.get("state.technology.answer.title"),
            LOCALE.ABSTRACT.get("state.technology.answer.body"),
            LOCALE.ABSTRACT.get("state.technology.answer.instructions.1"),
            conversation_openai_1.getLastMessage(),
            conversation_openai_1.getLastMessage()
        );
        idea.next_state = STATE.CUSTOMERS;

        return answer;
    }
}

module.exports = {
    AbstractBot
}
