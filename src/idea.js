const STATE = require('./state.js');
const { IdeaConnector } = require('./lib/mongodb.js')

class Idea {

    constructor(id, body, sections, state = STATE.NEW) {
		this.id = id;
		this.body = body;
		this.sections = sections;
		this.state = state;
	}

	async fetch() {
		const fetch_idea = await new IdeaConnector().get(this);
		if(fetch_idea) {
			this.state = fetch_idea.state;
		}
	}

	async save(){
		await new IdeaConnector().set(this);
	}
}

module.exports = {
	Idea
}
