const { AbstractParser } = require('../abstract/abstractParser');
const { MapMatcher } = require("../../lib/matcher");
const { Idea } = require('../../idea');
const SECTION = require('../../section');

class GithubParser extends AbstractParser {

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

	static MATCHER = new MapMatcher(GithubParser.CLOSEST_MATCH_MAPPING);

    parse(issue) {
        const id = this.#getId(issue);
        const body = issue.data.body;
        const sections = this.#getSections(issue);
		return new Idea(id, body, sections);
    }

    #getId(issue){
        return //TODO
    }

	#getSections(issue) {
		// Find sections in the body
		let lines = issue.data.body.split("\n");
		let sections_location = [];
		for (const [i, line] of lines.entries()) {
			if (line.trim().startsWith(GithubParser.SECTION_DELIMITER_SUBSTRING)) {
				const match = GithubParser.MATCHER.get(line);
				if (match != undefined) {
					const name = GithubParser.CLOSEST_MATCH_MAPPING[match];
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
    GithubParser
}
