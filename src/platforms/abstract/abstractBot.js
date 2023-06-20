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
            case STATE.NONE:
                break;
            case STATE.NEW:
            case STATE.UNSTRUCTURED:
                response = await this.stateUnstructured(idea);
                break;
            case STATE.P:
                if (idea.sections.hasOwnProperty(SECTION.PROBLEMATIC) && idea.sections.hasOwnProperty(SECTION.SOLUTION)) {
                    response = await this.stateP(idea);
                }
                break;
            case STATE.PS:
                if (idea.sections.hasOwnProperty(SECTION.PROBLEMATIC) && idea.sections.hasOwnProperty(SECTION.SOLUTION)) {
                    response = await this.statePS(idea);
                }
                break
            default:
                throw new Error(`Unknown state: ${idea.state}`);
        }
        return response;
    }
}

module.exports = {
    AbstractBot
}
