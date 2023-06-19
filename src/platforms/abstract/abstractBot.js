const { OpenAi } = require("../../lib/openai");
const { DoNothingError } = require('../../error');
const SECTION = require('../../section');

class AbstractBot {

	constructor() {
		this.openAi = new OpenAi();
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
                throw new DoNothingError("PS state not implemented");
            default:
                throw new Error(`Unknown state: ${idea.state}`);
        }
        return response;
    }
}

module.exports = {
    AbstractBot
}
