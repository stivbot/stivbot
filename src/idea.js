const { MapMatcher } = require("./matcher.js");
const SECTION = require('./section.js');
const STATE = require('./state.js');
const { IdeaConnector } = require('./mongodb.js')

class Idea {

	static SECTION_DELIMITER_SUBSTRING = "##"
	static CLOSEST_MATCH_MAPPING = {
		"idea": SECTION.INTRO,
		"title": SECTION.INTRO,
		"project": SECTION.INTRO,
		"app": SECTION.INTRO,
		"problematic": SECTION.PROBLEMATIC,
		"problem": SECTION.PROBLEMATIC,
		"solution": SECTION.SOLUTION,
		"advantages": SECTION.PROS,
		"disadvantages": SECTION.CONS,
		"pros": SECTION.PROS,
		"cons": SECTION.CONS,
		"assumptions": SECTION.ASSUMPTIONS,
		"hypothesis": SECTION.ASSUMPTIONS,
	};

	static MATCHER = new MapMatcher(Idea.CLOSEST_MATCH_MAPPING);

    constructor(issue, state = STATE.NEW) {
		this.id = //TODO
		this.body = issue.data.body;
		this.sections = this.#parseBody(this.body);
		this.state = state;
	}

	async fetch() {
		const fetch_idea = await new IdeaConnector().get(this.id);
		if(fetch_idea) {
			this.state = fetch_idea.state;
		}
	}

	async save(){
		await new IdeaConnector().set(this);
	}

	#parseBody(body) {
		// Find sections in the body
		let lines = body.split("\n");
		let sections_location = [];
		for (const [i, line] of lines.entries()) {
			if (line.trim().startsWith(Idea.SECTION_DELIMITER_SUBSTRING)) {
				const match = Idea.MATCHER.get(line);
				if (match != undefined) {
					const name = Idea.CLOSEST_MATCH_MAPPING[match];
					sections_location.push({
						name,
						start: i,
						end: null
					});

				}
			}
		}

		// Find end of sections
		for (const [i, section_location] of sections_location.entries()) {
			if (i > 0) {
				sections_location[i-1].end = section_location.start - 1;
			}
		}
		if (sections_location.length > 0) {
			sections_location[sections_location.length-1].end = lines.length
		}

		// Build sections from lines
		let sections = {}
		for (const section_location of sections_location) {
			const chunk = lines.slice(section_location.start + 1, section_location.end);
			const section_body = chunk.join('\n');
			sections[section_location.name] = section_body.trim();
		}
		
		return sections;
	}
}

module.exports = {
	Idea
}
